using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace Gomibox.Api;

public abstract class MongoEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Address
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string Label { get; set; } = "Home";
    public string FullName { get; set; } = "";
    [BsonElement("address")]
    public string AddressLine { get; set; } = "";
    public string? Apartment { get; set; }
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string ZipCode { get; set; } = "";
    public string Country { get; set; } = "US";
    public string? Phone { get; set; }
}

public sealed class User : MongoEntity
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    [JsonIgnore]
    public string Password { get; set; } = "";
    public string Role { get; set; } = "customer";
    public string? Phone { get; set; }
    public List<Address> Addresses { get; set; } = [];
}

public sealed class Category : MongoEntity
{
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Description { get; set; } = "";
    public string Icon { get; set; } = "";
}

public sealed class Dimensions
{
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public decimal Depth { get; set; }
}

public sealed class Product : MongoEntity
{
    public string Name { get; set; } = "";
    public string Tagline { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public decimal DiscountPercentage { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string Category { get; set; } = "";
    public decimal Rating { get; set; }
    public int Stock { get; set; }
    public List<string> Images { get; set; } = [];
    public string Thumbnail { get; set; } = "";
    public List<string> Colors { get; set; } = [];
    public List<string> Features { get; set; } = [];
    public string Brand { get; set; } = "";
    public string Sku { get; set; } = "";
    public decimal Weight { get; set; }
    public Dimensions Dimensions { get; set; } = new();
    public string WarrantyInformation { get; set; } = "";
    public string ShippingInformation { get; set; } = "";
    public string ReturnPolicy { get; set; } = "";
    public string AvailabilityStatus { get; set; } = "In Stock";
    public int MinimumOrderQuantity { get; set; } = 1;
    [BsonIgnore]
    public object? CategoryInfo { get; set; }
}

public sealed class CartItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    [BsonRepresentation(BsonType.ObjectId)]
    public string Product { get; set; } = "";
    public int Quantity { get; set; } = 1;
    public string SelectedColor { get; set; } = "";
    [BsonIgnore]
    public Product? ProductInfo { get; set; }
}

public sealed class Cart : MongoEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string User { get; set; } = "";
    public List<CartItem> Items { get; set; } = [];
    public string PromoCode { get; set; } = "";
}

public sealed class OrderItem
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Product { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string SelectedColor { get; set; } = "";
    public string Image { get; set; } = "";
}

public sealed class ShippingAddress
{
    public string FullName { get; set; } = "";
    public string Address { get; set; } = "";
    public string? Apartment { get; set; }
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string ZipCode { get; set; } = "";
    public string Country { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
}

public sealed class Order : MongoEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string User { get; set; } = "";
    public string OrderNumber { get; set; } = "";
    public List<OrderItem> Items { get; set; } = [];
    public ShippingAddress ShippingAddress { get; set; } = new();
    public string PaymentMethod { get; set; } = "";
    public string ShippingMethod { get; set; } = "standard";
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Shipping { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending";
    [BsonIgnore]
    public User? UserInfo { get; set; }
}

public sealed class PromoCode : MongoEntity
{
    public string Code { get; set; } = "";
    public string DiscountType { get; set; } = "";
    public decimal DiscountValue { get; set; }
    public decimal MinOrder { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
}

public sealed class Review : MongoEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Product { get; set; } = "";
    [BsonRepresentation(BsonType.ObjectId)]
    public string User { get; set; } = "";
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    [BsonIgnore]
    public User? UserInfo { get; set; }
}

public record RegisterRequest(string Name, string Email, string Password, string? Phone);
public record LoginRequest(string Email, string Password);
public record CartAddRequest(string ProductId, int Quantity = 1, string SelectedColor = "");
public record CartUpdateRequest(int Quantity);
public record PromoRequest(string Code, decimal Subtotal);
public record ReviewRequest(int Rating, string Comment);
public record StatusRequest(string Status);
public record CheckoutRequest(
    string Email, string Phone, string FirstName, string LastName, string Address,
    string? Apartment, string City, string State, string ZipCode, string Country,
    string ShippingMethod, string PaymentMethod, string? CardNumber, string? CardExpiry,
    string? CardCvc, string? CardHolder, string? PromoCode);
