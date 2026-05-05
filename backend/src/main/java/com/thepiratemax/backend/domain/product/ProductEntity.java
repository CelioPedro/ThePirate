package com.thepiratemax.backend.domain.product;

import com.thepiratemax.backend.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class ProductEntity extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CatalogCategoryEntity catalogCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Column(nullable = false)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column(name = "price_cents", nullable = false)
    private long priceCents;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "region_code", nullable = false, length = 8)
    private String regionCode;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false)
    private DeliveryType deliveryType;

    @Column(name = "requires_stock", nullable = false)
    private boolean requiresStock;

    @Column(name = "fulfillment_notes", columnDefinition = "text")
    private String fulfillmentNotes;

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public CatalogCategoryEntity getCatalogCategory() {
        return catalogCategory;
    }

    public void setCatalogCategory(CatalogCategoryEntity catalogCategory) {
        this.catalogCategory = catalogCategory;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public void setProvider(ProductProvider provider) {
        this.provider = provider.name();
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public long getPriceCents() {
        return priceCents;
    }

    public void setPriceCents(long priceCents) {
        this.priceCents = priceCents;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getRegionCode() {
        return regionCode;
    }

    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public DeliveryType getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(DeliveryType deliveryType) {
        this.deliveryType = deliveryType;
    }

    public boolean isRequiresStock() {
        return requiresStock;
    }

    public void setRequiresStock(boolean requiresStock) {
        this.requiresStock = requiresStock;
    }

    public String getFulfillmentNotes() {
        return fulfillmentNotes;
    }

    public void setFulfillmentNotes(String fulfillmentNotes) {
        this.fulfillmentNotes = fulfillmentNotes;
    }
}
