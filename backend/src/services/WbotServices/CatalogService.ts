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

export const getCatalog = async (wbot: WASocket, ownerJid: string): Promise<Product[]> => {
  try {
    // Ensure JID is correct format
    const jid = isJidUser(ownerJid) ? ownerJid : `${ownerJid.split('@')[0]}@s.whatsapp.net`;
    
    // @ts-ignore - Baileys types might not be fully updated in our environment
    const result = await wbot.getCatalog(jid, 100); 
    
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

export const getProductById = async (wbot: WASocket, ownerJid: string, productId: string): Promise<any | null> => {
   try {
       const jid = isJidUser(ownerJid) ? ownerJid : `${ownerJid.split('@')[0]}@s.whatsapp.net`;
       
       // @ts-ignore
       const result = await wbot.getProduct(jid, productId);
       if (result) return result;
       
       // Fallback: search in catalog
       // @ts-ignore
       const catalog = await wbot.getCatalog(jid, 100);
       return catalog?.products?.find((p: any) => p.productId === productId) || null;
   } catch (err) {
       console.error("[CatalogService] Error getting product:", err);
       return null;
   }
};

export const sendProduct = async (
    wbot: WASocket, 
    toJid: string, 
    ownerJid: string, 
    product: any
): Promise<any> => {
    try {
        // Construct product message
        // We need the raw product object usually, or at least specific fields
        // If 'product' comes from getCatalog, it has the shape Baileys expects (mostly)
        
        // Note: Sending product messages often requires the image to be available
        // If product.mediaUrl is a remote URL, Baileys might handle it, or we might need to download?
        // Baileys sendMessage with 'product' usually expects 'productImage' (buffer) or 'url' if supported?
        // Let's assume we pass the product object structure Baileys expects.
        
        /* 
           Baileys expect:
           product: {
             productImage: { url: ... } or Buffer,
             productId: ...,
             title: ...,
             ...
           }
        */

        // Simplest attempt: pass the product object we got from getProduct/getCatalog
        // We might need to adjust the image field.
        
        // If product has 'mediaUrl', we might need to fetch it if Baileys doesn't handle remote URLs automatically for products?
        // Actually, for product messages, the image is usually part of the metadata.
        
        const businessJid = isJidUser(ownerJid) ? ownerJid : `${ownerJid.split('@')[0]}@s.whatsapp.net`;

        await wbot.sendMessage(toJid, {
            product: {
                productImage: product.image ? { url: product.image } : undefined,
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
