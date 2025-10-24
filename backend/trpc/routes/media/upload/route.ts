import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import prisma from "../../../../db";
import { uploadFile, deleteFile } from "../../../../storage";

export const uploadMediaProcedure = publicProcedure
  .input(
    z.object({
      filename: z.string(),
      mimeType: z.string(),
      base64Data: z.string(),
      userId: z.string(),
      type: z.enum(['image', 'video', 'document']),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const storageResult = await uploadFile(
        input.base64Data,
        input.filename,
        input.mimeType
      );

      const size = Math.round(input.base64Data.replace(/^data:[^;]+;base64,/, '').length * 0.75);

      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          userId: input.userId,
          filename: input.filename,
          mimeType: input.mimeType,
          size,
          url: storageResult.url,
          storageKey: storageResult.key,
          type: input.type,
        },
      });

      console.log('[Media] Uploaded file:', uploadedFile.id, uploadedFile.filename);

      return {
        success: true,
        file: {
          id: uploadedFile.id,
          url: uploadedFile.url,
          filename: uploadedFile.filename,
        },
      };
    } catch (error) {
      console.error('[Media] Upload error:', error);
      throw new Error('Failed to upload file');
    }
  });

export const listMediaProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(['image', 'video', 'document', 'all']).optional(),
    })
  )
  .query(async ({ input }) => {
    try {
      const where: any = { userId: input.userId };
      
      if (input.type && input.type !== 'all') {
        where.type = input.type;
      }

      const files = await prisma.uploadedFile.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
      });

      return {
        files: files.map((f: any) => ({
          id: f.id,
          url: f.url,
          filename: f.filename,
          mimeType: f.mimeType,
          size: f.size,
          uploadedAt: f.uploadedAt.toISOString(),
        })),
      };
    } catch (error) {
      console.error('[Media] List error:', error);
      throw new Error('Failed to list files');
    }
  });

export const deleteMediaProcedure = publicProcedure
  .input(
    z.object({
      fileId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const file = await prisma.uploadedFile.findUnique({
        where: { id: input.fileId },
      });

      if (!file) {
        throw new Error('File not found');
      }

      if (file.userId !== input.userId) {
        throw new Error('Unauthorized');
      }

      if (file.storageKey) {
        await deleteFile(file.storageKey);
      }

      await prisma.uploadedFile.delete({
        where: { id: input.fileId },
      });

      console.log('[Media] Deleted file:', file.id, file.filename);

      return { success: true };
    } catch (error) {
      console.error('[Media] Delete error:', error);
      throw new Error('Failed to delete file');
    }
  });
