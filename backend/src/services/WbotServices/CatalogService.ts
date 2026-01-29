import { WASocket } from "@whiskeysockets/baileys";
import { isJidUser } from "@whiskeysockets/baileys";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  isHidden?: boolean;
  image?: string;
  retailerId?: string;
  url?: string;
  productImageCount?: number;
}

export const getCatalog = async (
  wbot: WASocket,
  ownerJid: string
): Promise<Product[]> => {
  try {
    // Ensure JID is correct format
    const jid = isJidUser(ownerJid)
      ? ownerJid
      : `${ownerJid.split("@")[0]}@s.whatsapp.net`;

    // @ts-ignore - Baileys types might not be fully updated in our environment
    const result = await wbot.getCatalog(jid, 100);

    console.log(
      `[CatalogService] Fetched ${
        result?.products?.length || 0
      } products for ${jid}`
    );
    if (result?.products?.length > 0) {
      console.log(
        `[CatalogService] First product sample: ${JSON.stringify(
          result.products[0]
        )}`
      );
    }

    if (!result || !result.products) {
      return [];
    }

    return result.products.map((p: any) => ({
      id: p.productId,
      name: p.title,
      description: p.description,
      price: p.priceAmount1000,
      currency: p.currencyCode,
      image: p.mediaUrl,
      retailerId: p.retailerId,
      url: p.url,
      productImageCount: p.productImageCount
    }));
  } catch (error) {
    console.error("[CatalogService] Error getting catalog:", error);
    return [];
  }
};

export const getProductById = async (
  wbot: WASocket,
  ownerJid: string,
  productId: string
): Promise<any | null> => {
  try {
    const jid = isJidUser(ownerJid)
      ? ownerJid
      : `${ownerJid.split("@")[0]}@s.whatsapp.net`;

    // @ts-ignore
    const result = await wbot.getProduct(jid, productId);
    if (result) return result;

    // Fallback: search in catalog
    // @ts-ignore
    const catalog = await wbot.getCatalog(jid, 100);
    return (
      catalog?.products?.find((p: any) => p.productId === productId) || null
    );
  } catch (err) {
    console.error("[CatalogService] Error getting product:", err);
    return null;
  }
};

import axios from "axios";

export const sendProduct = async (
  wbot: WASocket,
  toJid: string,
  ownerJid: string,
  product: any
): Promise<any> => {
  try {
    const businessJid = isJidUser(ownerJid)
      ? ownerJid
      : `${ownerJid.split("@")[0]}@s.whatsapp.net`;

    let productImage: any = undefined;

    // Try to download image if it's a URL
    if (product.image && typeof product.image === "string") {
      try {
        const response = await axios.get(product.image, {
          responseType: "arraybuffer"
        });
        productImage = Buffer.from(response.data, "binary");
      } catch (err) {
        console.warn(
          "[CatalogService] Failed to download product image, sending without image:",
          err.message
        );
      }
    }

    await wbot.sendMessage(toJid, {
      product: {
        productImage: productImage,
        productId: product.id || product.productId,
        title: product.name || product.title,
        description: product.description,
        currencyCode: product.currency || product.currencyCode,
        priceAmount1000: product.price || product.priceAmount1000,
        retailerId: product.retailerId,
        url: product.url,
        productImageCount: product.productImageCount || 1
      },
      businessOwnerJid: businessJid
    });
  } catch (error) {
    console.error("[CatalogService] Error sending product:", error);
    throw error;
  }
};
