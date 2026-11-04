using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;

namespace Gomibox.Api;

public static class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Configuration.AddEnvironmentVariables();

        var mongoUri = Required("MONGO_URI", builder.Configuration["MONGO_URI"] ?? builder.Configuration["Mongo:ConnectionString"]);
        var jwtSecret = Required("JWT_SECRET", builder.Configuration["JWT_SECRET"] ?? builder.Configuration["Jwt:Secret"]);
        var jwtLifetime = ParseLifetime(builder.Configuration["JWT_EXPIRES_IN"] ?? "7d");
        if (jwtSecret.Length < 32)
            throw new InvalidOperationException("JWT_SECRET debe tener al menos 32 caracteres.");

        var origins = (builder.Configuration["CORS_ORIGIN"] ??
            string.Join(',', builder.Configuration.GetSection("CorsOrigins").Get<string[]>() ?? []))
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var databaseName = builder.Configuration["MONGO_DATABASE"] ??
            builder.Configuration["Mongo:Database"] ?? "gomibox";

        ConventionRegistry.Register("gomibox-camel-case", new ConventionPack
        {
            new CamelCaseElementNameConvention()
        }, _ => true);

        builder.Services.AddSingleton<IMongoDatabase>(_ =>
            new MongoClient(mongoUri).GetDatabase(databaseName));
        builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
            policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });
        builder.Services.AddAuthorization();

        var app = builder.Build();
        app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
        {
            var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
            var (status, message) = feature?.Error switch
            {
                ApiException e => (e.StatusCode, e.Message),
                FormatException => (400, "Invalid request"),
                _ => (500, "Internal server error")
            };
            context.Response.StatusCode = status;
            await Results.Json(new { success = false, message }).ExecuteAsync(context);
        }));
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();

        var db = app.Services.GetRequiredService<IMongoDatabase>();
        var users = db.GetCollection<User>("users");
        var products = db.GetCollection<Product>("products");
        var categories = db.GetCollection<Category>("categories");
        var carts = db.GetCollection<Cart>("carts");
        var orders = db.GetCollection<Order>("orders");
        var promos = db.GetCollection<PromoCode>("promocodes");
        var reviews = db.GetCollection<Review>("reviews");

        app.MapGet("/api/health", () => Results.Ok(new { success = true, message = "Gomibox API running" }));

        app.MapPost("/api/auth/register", async (RegisterRequest request) =>
        {
            ValidateRegister(request);
            var email = request.Email.Trim().ToLowerInvariant();
            if (await users.Find(x => x.Email == email).AnyAsync())
                throw new ApiException(409, "Email already registered");
            var user = new User { Name = request.Name.Trim(), Email = email, Password = global::BCrypt.Net.BCrypt.HashPassword(request.Password, 12), Phone = request.Phone };
            await users.InsertOneAsync(user);
            return Results.Json(new { success = true, data = new { user = PublicUser(user), token = CreateToken(user, jwtSecret, jwtLifetime) } }, statusCode: 201);
        });

        app.MapPost("/api/auth/login", async (LoginRequest request) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new ApiException(400, "Email and password are required");
            var user = await users.Find(x => x.Email == request.Email.Trim().ToLowerInvariant()).FirstOrDefaultAsync();
            if (user is null || !global::BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                throw new ApiException(401, "Invalid email or password");
            return Results.Ok(new { success = true, data = new { user = PublicUser(user), token = CreateToken(user, jwtSecret, jwtLifetime) } });
        });

        app.MapGet("/api/auth/me", async (ClaimsPrincipal principal) =>
        {
            var user = await CurrentUser(users, principal);
            return Results.Ok(new { success = true, data = PublicUser(user) });
        }).RequireAuthorization();

        app.MapPut("/api/auth/profile", async (ClaimsPrincipal principal, ProfileRequest request) =>
        {
            var user = await CurrentUser(users, principal);
            if (!string.IsNullOrWhiteSpace(request.Name)) user.Name = request.Name.Trim();
            if (request.Phone is not null) user.Phone = request.Phone;
            if (request.Addresses is not null) user.Addresses = request.Addresses;
            user.UpdatedAt = DateTime.UtcNow;
            await users.ReplaceOneAsync(x => x.Id == user.Id, user);
            return Results.Ok(new { success = true, data = PublicUser(user) });
        }).RequireAuthorization();

        app.MapGet("/api/products", async (string? search, string? category, string? sortBy, int page = 1,
            int limit = 20, decimal? minPrice = null, decimal? maxPrice = null, decimal? minRating = null, bool? inStock = null) =>
        {
            var result = await ProductPage(products, categories, search, category, sortBy, page, Math.Clamp(limit, 1, 50), minPrice, maxPrice, minRating, inStock);
            return Results.Ok(new { success = true, result.Products, result.Total, result.Page, result.Limit, result.TotalPages });
        });

        app.MapGet("/api/products/featured", async (int limit = 8) =>
        {
            var list = await products.Find(x => x.Rating >= 4).SortByDescending(x => x.Rating).ThenByDescending(x => x.CreatedAt)
                .Limit(Math.Clamp(limit, 1, 50)).ToListAsync();
            await PopulateCategories(list, categories);
            return Results.Ok(new { success = true, data = list });
        });

        app.MapGet("/api/products/category/{slug}", async (string slug, string? sortBy, int page = 1, int limit = 20) =>
        {
            var category = await categories.Find(x => x.Slug == slug.ToLowerInvariant()).FirstOrDefaultAsync();
            if (category is null) return Results.Ok(new { success = true, products = Array.Empty<Product>(), total = 0, page, limit, totalPages = 0 });
            var result = await ProductPage(products, categories, null, category.Id, sortBy, page, Math.Clamp(limit, 1, 50), null, null, null, null);
            return Results.Ok(new { success = true, result.Products, result.Total, result.Page, result.Limit, result.TotalPages });
        });

        app.MapGet("/api/products/{id}", async (string id) =>
        {
            var product = await FindById(products, id, "Product not found");
            await PopulateCategories([product], categories);
            return Results.Ok(new { success = true, data = product });
        });

        app.MapGet("/api/categories", async () =>
            Results.Ok(new { success = true, data = await categories.Find(FilterDefinition<Category>.Empty).SortBy(x => x.Name).ToListAsync() }));
        app.MapGet("/api/categories/names", async () =>
            Results.Ok(new { success = true, data = (await categories.Find(FilterDefinition<Category>.Empty).SortBy(x => x.Name).ToListAsync()).Select(x => x.Slug) }));
        app.MapGet("/api/categories/{slug}", async (string slug) =>
        {
            var category = await categories.Find(x => x.Slug == slug).FirstOrDefaultAsync() ??
                throw new ApiException(404, "Category not found");
            return Results.Ok(new { success = true, data = category });
        });

        app.MapGet("/api/cart", async (ClaimsPrincipal principal) =>
            Results.Ok(new { success = true, data = await GetCart(carts, products, await UserId(principal)) })).RequireAuthorization();
        app.MapPost("/api/cart", async (ClaimsPrincipal principal, CartAddRequest request) =>
        {
            if (request.Quantity < 1) throw new ApiException(400, "Quantity must be at least 1");
            var userId = await UserId(principal);
            var product = await FindById(products, request.ProductId, "Product not found");
            if (product.Stock < request.Quantity) throw new ApiException(400, "Not enough stock available");
            var cart = await GetOrCreateCart(carts, userId);
            var item = cart.Items.FirstOrDefault(x => x.Product == product.Id && x.SelectedColor == request.SelectedColor);
            if (item is null) cart.Items.Add(new CartItem { Product = product.Id, Quantity = request.Quantity, SelectedColor = request.SelectedColor });
            else item.Quantity += request.Quantity;
            cart.UpdatedAt = DateTime.UtcNow;
            await carts.ReplaceOneAsync(x => x.Id == cart.Id, cart);
            return Results.Ok(new { success = true, data = await GetCart(carts, products, userId) });
        }).RequireAuthorization();
        app.MapPut("/api/cart/{itemId}", async (ClaimsPrincipal principal, string itemId, CartUpdateRequest request) =>
            Results.Ok(new { success = true, data = await ChangeCart(carts, products, await UserId(principal), itemId, request.Quantity, false) })).RequireAuthorization();
        app.MapDelete("/api/cart/{itemId}", async (ClaimsPrincipal principal, string itemId) =>
            Results.Ok(new { success = true, data = await ChangeCart(carts, products, await UserId(principal), itemId, 0, true) })).RequireAuthorization();
        app.MapDelete("/api/cart", async (ClaimsPrincipal principal) =>
        {
            var cart = await GetOrCreateCart(carts, await UserId(principal));
            cart.Items = []; cart.PromoCode = ""; cart.UpdatedAt = DateTime.UtcNow;
            await carts.ReplaceOneAsync(x => x.Id == cart.Id, cart);
            return Results.Ok(new { success = true, message = "Cart cleared" });
        }).RequireAuthorization();

        app.MapPost("/api/promo/validate", async (PromoRequest request) =>
        {
            var promo = await ValidPromo(promos, request.Code, request.Subtotal);
            var discount = promo.DiscountType == "percentage" ? Math.Round(request.Subtotal * promo.DiscountValue / 100, 2) : Math.Min(promo.DiscountValue, request.Subtotal);
            return Results.Ok(new { success = true, data = new { code = promo.Code, promo.DiscountType, promo.DiscountValue, discountAmount = discount } });
        });

        app.MapPost("/api/orders", async (ClaimsPrincipal principal, CheckoutRequest request) =>
        {
            ValidateCheckout(request);
            var userId = await UserId(principal);
            var cart = await GetOrCreateCart(carts, userId);
            if (cart.Items.Count == 0) throw new ApiException(400, "Cart is empty");
            var productIds = cart.Items.Select(x => x.Product).ToList();
            var productList = await products.Find(x => productIds.Contains(x.Id)).ToListAsync();
            var byId = productList.ToDictionary(x => x.Id);
            var subtotal = cart.Items.Sum(x => byId[x.Product].Price * x.Quantity);
            PromoCode? promo = null;
            if (!string.IsNullOrWhiteSpace(request.PromoCode)) promo = await TryValidPromo(promos, request.PromoCode, subtotal);
            var discount = promo is null ? 0 : promo.DiscountType == "percentage" ? Math.Round(subtotal * promo.DiscountValue / 100, 2) : Math.Min(promo.DiscountValue, subtotal);
            var shipping = promo?.Code == "FREESHIP" || subtotal > 150 ? 0 : request.ShippingMethod switch { "express" => 14.99m, "overnight" => 29.99m, _ => 5.99m };
            var tax = Math.Round((subtotal - discount) * .08m, 2);
            var order = new Order { User = userId, OrderNumber = $"AURA-{Random.Shared.Next(100000, 1000000)}",
                Items = cart.Items.Select(i => new OrderItem { Product = i.Product, Name = byId[i.Product].Name, Price = byId[i.Product].Price, Quantity = i.Quantity, SelectedColor = i.SelectedColor, Image = byId[i.Product].Images.FirstOrDefault() ?? byId[i.Product].Thumbnail }).ToList(),
                ShippingAddress = new ShippingAddress { FullName = $"{request.FirstName} {request.LastName}", Address = request.Address, Apartment = request.Apartment, City = request.City, State = request.State, ZipCode = request.ZipCode, Country = request.Country, Email = request.Email, Phone = request.Phone },
                PaymentMethod = request.PaymentMethod, ShippingMethod = request.ShippingMethod, Subtotal = subtotal, Discount = discount, Shipping = shipping, Tax = tax, Total = Math.Round(subtotal - discount + shipping + tax, 2) };
            await orders.InsertOneAsync(order);
            if (promo is not null && promo.UsageLimit > 0) await promos.UpdateOneAsync(x => x.Id == promo.Id, Builders<PromoCode>.Update.Inc(x => x.UsedCount, 1));
            cart.Items = []; cart.PromoCode = ""; await carts.ReplaceOneAsync(x => x.Id == cart.Id, cart);
            return Results.Json(new { success = true, data = order }, statusCode: 201);
        }).RequireAuthorization();
        app.MapGet("/api/orders", async (ClaimsPrincipal principal, int page = 1, int limit = 10) =>
        {
            var userId = await UserId(principal); limit = Math.Clamp(limit, 1, 50);
            var filter = orders.Find(x => x.User == userId); var total = await filter.CountDocumentsAsync();
            var list = await filter.SortByDescending(x => x.CreatedAt).Skip((page - 1) * limit).Limit(limit).ToListAsync();
            return Results.Ok(new { success = true, orders = list, total, page, limit, totalPages = (int)Math.Ceiling(total / (double)limit) });
        }).RequireAuthorization();
        app.MapGet("/api/orders/{id}", async (ClaimsPrincipal principal, string id) =>
        {
            var userId = await UserId(principal);
            var order = await orders.Find(x => x.Id == id && x.User == userId).FirstOrDefaultAsync() ??
                throw new ApiException(404, "Order not found");
            return Results.Ok(new { success = true, data = order });
        }).RequireAuthorization();

        app.MapGet("/api/reviews/product/{productId}", async (string productId, int page = 1, int limit = 10) =>
        {
            limit = Math.Clamp(limit, 1, 50); var filter = reviews.Find(x => x.Product == productId); var total = await filter.CountDocumentsAsync();
            var list = await filter.SortByDescending(x => x.CreatedAt).Skip((page - 1) * limit).Limit(limit).ToListAsync();
            foreach (var review in list) review.UserInfo = await users.Find(x => x.Id == review.User).FirstOrDefaultAsync();
            return Results.Ok(new { success = true, reviews = list, total, page, limit, totalPages = (int)Math.Ceiling(total / (double)limit) });
        });
        app.MapPost("/api/reviews/product/{productId}", async (ClaimsPrincipal principal, string productId, ReviewRequest request) =>
        {
            if (request.Rating is < 1 or > 5 || request.Comment.Length is < 3 or > 500) throw new ApiException(400, "Invalid review");
            var userId = await UserId(principal); _ = await FindById(products, productId, "Product not found");
            if (await reviews.Find(x => x.Product == productId && x.User == userId).AnyAsync()) throw new ApiException(409, "You have already reviewed this product");
            var review = new Review { Product = productId, User = userId, Rating = request.Rating, Comment = request.Comment };
            await reviews.InsertOneAsync(review);
            var all = await reviews.Find(x => x.Product == productId).ToListAsync();
            await products.UpdateOneAsync(x => x.Id == productId, Builders<Product>.Update.Set(x => x.Rating, Math.Round((decimal)all.Average(x => x.Rating), 1)));
            review.UserInfo = await users.Find(x => x.Id == userId).FirstOrDefaultAsync();
            return Results.Json(new { success = true, data = review }, statusCode: 201);
        }).RequireAuthorization();

        MapAdmin(app, users, products, categories, orders);
        app.Run();
    }

    private static void MapAdmin(WebApplication app, IMongoCollection<User> users, IMongoCollection<Product> products,
        IMongoCollection<Category> categories, IMongoCollection<Order> orders)
    {
        var group = app.MapGroup("/api/admin").RequireAuthorization();
        group.AddEndpointFilter(async (context, next) =>
        {
            if (context.HttpContext.User.FindFirstValue(ClaimTypes.Role) != "admin")
                return Results.Json(new { success = false, message = "Admin access required" }, statusCode: 403);
            return await next(context);
        });
        group.MapGet("/stats", async () => Results.Ok(new { success = true, data = new {
            productCount = await products.CountDocumentsAsync(_ => true), categoryCount = await categories.CountDocumentsAsync(_ => true),
            userCount = await users.CountDocumentsAsync(_ => true), orderCount = await orders.CountDocumentsAsync(_ => true),
            recentOrders = await orders.Find(_ => true).SortByDescending(x => x.CreatedAt).Limit(5).ToListAsync() } }));
        group.MapGet("/products", async (int page = 1, int limit = 20) => await AdminProducts(products, categories, page, limit));
        group.MapPost("/products", async (Product product, string? categorySlug = null) =>
        {
            if (!string.IsNullOrWhiteSpace(categorySlug)) product.Category = (await CategoryForSlug(categories, categorySlug)).Id;
            await products.InsertOneAsync(product); return Results.Json(new { success = true, data = product }, statusCode: 201);
        });
        group.MapPut("/products/{id}", async (string id, Product update, string? categorySlug = null) =>
        {
            var existing = await FindById(products, id, "Product not found");
            update.Id = existing.Id; update.CreatedAt = existing.CreatedAt; update.UpdatedAt = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(categorySlug)) update.Category = (await CategoryForSlug(categories, categorySlug)).Id;
            await products.ReplaceOneAsync(x => x.Id == id, update); return Results.Ok(new { success = true, data = update });
        });
        group.MapDelete("/products/{id}", async (string id) => { _ = await FindById(products, id, "Product not found"); await products.DeleteOneAsync(x => x.Id == id); return Results.Ok(new { success = true, message = "Product deleted" }); });
        group.MapGet("/categories", async () => Results.Ok(new { success = true, data = await categories.Find(_ => true).SortBy(x => x.Name).ToListAsync() }));
        group.MapGet("/orders", async (int page = 1, int limit = 20) =>
        {
            limit = Math.Clamp(limit, 1, 50); var filter = orders.Find(_ => true); var total = await filter.CountDocumentsAsync();
            var list = await filter.SortByDescending(x => x.CreatedAt).Skip((page - 1) * limit).Limit(limit).ToListAsync();
            return Results.Ok(new { success = true, orders = list, total, page, limit, totalPages = (int)Math.Ceiling(total / (double)limit) });
        });
        group.MapPut("/orders/{id}/status", async (string id, StatusRequest request) =>
        {
            if (!new[] { "pending", "confirmed", "shipped", "delivered", "cancelled" }.Contains(request.Status)) throw new ApiException(400, "Invalid order status");
            var result = await orders.UpdateOneAsync(x => x.Id == id, Builders<Order>.Update.Set(x => x.Status, request.Status).Set(x => x.UpdatedAt, DateTime.UtcNow));
            if (result.MatchedCount == 0) throw new ApiException(404, "Order not found");
            var order = await orders.Find(x => x.Id == id).FirstAsync(); return Results.Ok(new { success = true, data = order });
        });
    }

    private static async Task<IResult> AdminProducts(IMongoCollection<Product> products, IMongoCollection<Category> categories, int page, int limit)
    {
        limit = Math.Clamp(limit, 1, 50); var filter = products.Find(_ => true); var total = await filter.CountDocumentsAsync();
        var list = await filter.SortByDescending(x => x.CreatedAt).Skip((page - 1) * limit).Limit(limit).ToListAsync(); await PopulateCategories(list, categories);
        return Results.Ok(new { success = true, products = list, total, page, limit, totalPages = (int)Math.Ceiling(total / (double)limit) });
    }

    private static string Required(string name, string? value) => string.IsNullOrWhiteSpace(value)
        ? throw new InvalidOperationException($"Falta la variable de entorno obligatoria: {name}.") : value;
    private static object PublicUser(User user) => new { id = user.Id, name = user.Name, email = user.Email, role = user.Role, phone = user.Phone, addresses = user.Addresses, createdAt = user.CreatedAt, updatedAt = user.UpdatedAt };
    private static string CreateToken(User user, string secret, TimeSpan lifetime)
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id), new Claim(ClaimTypes.Role, user.Role), new Claim(JwtRegisteredClaimNames.Email, user.Email) };
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.Add(lifetime), signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)), SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    private static TimeSpan ParseLifetime(string value)
    {
        if (value.EndsWith('d') && double.TryParse(value[..^1], out var days)) return TimeSpan.FromDays(days);
        if (value.EndsWith('h') && double.TryParse(value[..^1], out var hours)) return TimeSpan.FromHours(hours);
        if (TimeSpan.TryParse(value, out var duration)) return duration;
        throw new InvalidOperationException("JWT_EXPIRES_IN debe ser una duración válida, por ejemplo 7d o 12h.");
    }
    private static Task<string> UserId(ClaimsPrincipal principal) => Task.FromResult(principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new ApiException(401, "Authentication required"));
    private static async Task<User> CurrentUser(IMongoCollection<User> users, ClaimsPrincipal principal)
    {
        var userId = await UserId(principal);
        return await users.Find(x => x.Id == userId).FirstOrDefaultAsync() ?? throw new ApiException(404, "User not found");
    }
    private static async Task<T> FindById<T>(IMongoCollection<T> collection, string id, string message) where T : MongoEntity
    {
        if (!ObjectId.TryParse(id, out _)) throw new ApiException(404, message);
        return await collection.Find(Builders<T>.Filter.Eq(x => x.Id, id)).FirstOrDefaultAsync() ?? throw new ApiException(404, message);
    }
    private static async Task<Cart> GetOrCreateCart(IMongoCollection<Cart> carts, string userId)
    {
        var cart = await carts.Find(x => x.User == userId).FirstOrDefaultAsync();
        if (cart is not null) return cart;
        cart = new Cart { User = userId }; await carts.InsertOneAsync(cart); return cart;
    }
    private static async Task<object> GetCart(IMongoCollection<Cart> carts, IMongoCollection<Product> products, string userId)
    {
        var cart = await GetOrCreateCart(carts, userId); var ids = cart.Items.Select(x => x.Product).ToList();
        var list = await products.Find(x => ids.Contains(x.Id)).ToListAsync(); var map = list.ToDictionary(x => x.Id);
        foreach (var item in cart.Items) if (map.TryGetValue(item.Product, out var product)) item.ProductInfo = product;
        return new { cart.Id, cart.User, items = cart.Items, cart.PromoCode, cart.CreatedAt, cart.UpdatedAt,
            subtotal = Math.Round(cart.Items.Sum(x => x.ProductInfo?.Price * x.Quantity ?? 0), 2), itemCount = cart.Items.Sum(x => x.Quantity) };
    }
    private static async Task<object> ChangeCart(IMongoCollection<Cart> carts, IMongoCollection<Product> products, string userId, string itemId, int quantity, bool remove)
    {
        if (!remove && quantity < 0) throw new ApiException(400, "Quantity cannot be negative");
        var cart = await GetOrCreateCart(carts, userId); var item = cart.Items.FirstOrDefault(x => x.Id == itemId) ?? throw new ApiException(404, "Item not found in cart");
        if (remove || quantity == 0) cart.Items.Remove(item); else item.Quantity = quantity;
        await carts.ReplaceOneAsync(x => x.Id == cart.Id, cart); return await GetCart(carts, products, userId);
    }
    private static async Task PopulateCategories(List<Product> list, IMongoCollection<Category> categories)
    {
        var map = (await categories.Find(x => list.Select(p => p.Category).Contains(x.Id)).ToListAsync()).ToDictionary(x => x.Id);
        foreach (var product in list) if (map.TryGetValue(product.Category, out var cat)) product.CategoryInfo = new { cat.Id, cat.Name, cat.Slug };
    }
    private static async Task<Category> CategoryForSlug(IMongoCollection<Category> categories, string slug)
    {
        var category = await categories.Find(x => x.Slug == slug).FirstOrDefaultAsync();
        if (category is not null) return category;
        category = new Category { Name = string.Join(' ', slug.Split('-').Select(x => char.ToUpperInvariant(x[0]) + x[1..])), Slug = slug };
        await categories.InsertOneAsync(category); return category;
    }
    private static async Task<(List<Product> Products, long Total, int Page, int Limit, int TotalPages)> ProductPage(
        IMongoCollection<Product> products, IMongoCollection<Category> categories, string? search, string? category, string? sortBy, int page, int limit,
        decimal? minPrice, decimal? maxPrice, decimal? minRating, bool? inStock)
    {
        var filter = Builders<Product>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(search)) filter &= Builders<Product>.Filter.Or(
            Builders<Product>.Filter.Regex(x => x.Name, new BsonRegularExpression(search, "i")),
            Builders<Product>.Filter.Regex(x => x.Tagline, new BsonRegularExpression(search, "i")),
            Builders<Product>.Filter.Regex(x => x.Description, new BsonRegularExpression(search, "i")),
            Builders<Product>.Filter.Regex(x => x.Brand, new BsonRegularExpression(search, "i")));
        if (!string.IsNullOrWhiteSpace(category))
        {
            var categoryId = ObjectId.TryParse(category, out _) ? category : (await categories.Find(x => x.Slug == category).FirstOrDefaultAsync())?.Id;
            if (categoryId is not null) filter &= Builders<Product>.Filter.Eq(x => x.Category, categoryId);
        }
        if (minPrice.HasValue) filter &= Builders<Product>.Filter.Gte(x => x.Price, minPrice.Value);
        if (maxPrice.HasValue) filter &= Builders<Product>.Filter.Lte(x => x.Price, maxPrice.Value);
        if (minRating.HasValue) filter &= Builders<Product>.Filter.Gte(x => x.Rating, minRating.Value);
        if (inStock == true) filter &= Builders<Product>.Filter.Gt(x => x.Stock, 0);
        var find = products.Find(filter);
        find = sortBy switch { "price-asc" => find.SortBy(x => x.Price), "price-desc" => find.SortByDescending(x => x.Price), "rating-desc" => find.SortByDescending(x => x.Rating), "name-asc" => find.SortBy(x => x.Name), _ => find.SortByDescending(x => x.CreatedAt) };
        var total = await products.CountDocumentsAsync(filter); var list = await find.Skip((page - 1) * limit).Limit(limit).ToListAsync(); await PopulateCategories(list, categories);
        return (list, total, page, limit, (int)Math.Ceiling(total / (double)limit));
    }
    private static async Task<PromoCode> ValidPromo(IMongoCollection<PromoCode> promos, string code, decimal subtotal) =>
        await TryValidPromo(promos, code, subtotal) ?? throw new ApiException(404, "Invalid or expired promo code");
    private static async Task<PromoCode?> TryValidPromo(IMongoCollection<PromoCode> promos, string code, decimal subtotal)
    {
        var promo = await promos.Find(x => x.Code == code.ToUpperInvariant() && x.IsActive &&
            (x.ExpiresAt == null || x.ExpiresAt > DateTime.UtcNow)).FirstOrDefaultAsync();
        if (promo is null || (promo.MinOrder > 0 && subtotal < promo.MinOrder) || (promo.UsageLimit > 0 && promo.UsedCount >= promo.UsageLimit))
            return null;
        return promo;
    }
    private static void ValidateRegister(RegisterRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Name) || r.Name.Trim().Length is < 2 or > 100 || !r.Email.Contains('@') || r.Password.Length is < 6 or > 100)
            throw new ApiException(400, "Invalid registration data");
    }
    private static void ValidateCheckout(CheckoutRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Email) || string.IsNullOrWhiteSpace(r.Phone) || string.IsNullOrWhiteSpace(r.FirstName) ||
            string.IsNullOrWhiteSpace(r.LastName) || string.IsNullOrWhiteSpace(r.Address) || string.IsNullOrWhiteSpace(r.City) ||
            string.IsNullOrWhiteSpace(r.State) || string.IsNullOrWhiteSpace(r.ZipCode) || string.IsNullOrWhiteSpace(r.Country) ||
            !new[] { "standard", "express", "overnight" }.Contains(r.ShippingMethod) || !new[] { "card", "apple_pay", "upi", "cod" }.Contains(r.PaymentMethod))
            throw new ApiException(400, "Invalid checkout data");
    }
}

public sealed class ApiException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed record ProfileRequest(string? Name, string? Phone, List<Address>? Addresses);
