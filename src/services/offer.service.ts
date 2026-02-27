import prisma from '../config/database';
import { CreateOfferRequest } from '../types';

export class OfferService {
  async createOffer(data: CreateOfferRequest) {
    // Check if offer already exists
    const existing = await prisma.offer.findUnique({
      where: { title: data.title },
    });

    if (existing) {
      throw new Error('Offer with this title already exists');
    }

    // Validate dates if both provided
    if (data.validFrom && data.validUntil) {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);

      if (validFrom >= validUntil) {
        throw new Error('Valid from date must be before valid until date');
      }
    }

    // Parse decimal values
    const offerData: any = {
      title: data.title,
      description: data.description,
      validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    };

    if (data.discountPercentage !== undefined) {
      offerData.discountPercentage = parseFloat(data.discountPercentage as unknown as string);
    }

    if (data.discountPrice !== undefined) {
      offerData.discountPrice = parseFloat(data.discountPrice as unknown as string);
    }

    const offer = await prisma.offer.create({
      data: offerData,
    });

    return offer;
  }

  async getAllOffers(activeOnly?: boolean) {
    const where: any = {};

    if (activeOnly !== undefined) {
      where.isActive = activeOnly;
    }

    const offers = await prisma.offer.findMany({
      where,
      include: { products: true },
      orderBy: { title: 'asc' },
    });

    return offers;
  }

  async getOfferById(id: string) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    return offer;
  }

  async updateOffer(id: string, data: Partial<CreateOfferRequest>) {
    // Check if trying to update to an existing title
    if (data.title) {
      const existing = await prisma.offer.findFirst({
        where: {
          title: data.title,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error('Offer with this title already exists');
      }
    }

    // Validate dates if both provided
    if (data.validFrom && data.validUntil) {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);

      if (validFrom >= validUntil) {
        throw new Error('Valid from date must be before valid until date');
      }
    }

    // Parse decimal values
    const updateData: any = { ...data };

    if (data.discountPercentage !== undefined) {
      updateData.discountPercentage = parseFloat(data.discountPercentage as unknown as string);
    }

    if (data.discountPrice !== undefined) {
      updateData.discountPrice = parseFloat(data.discountPrice as unknown as string);
    }

    if (data.validFrom !== undefined) {
      updateData.validFrom = data.validFrom ? new Date(data.validFrom) : null;
    }

    if (data.validUntil !== undefined) {
      updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    return offer;
  }

  async deleteOffer(id: string, force?: boolean) {
    // Check if offer has products
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.products.length > 0 && !force) {
      // Soft delete by setting isActive to false
      await prisma.offer.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, message: 'Offer has products, deactivated instead' };
    }

    await prisma.offer.delete({
      where: { id },
    });

    return { success: true };
  }
}

export default new OfferService();
