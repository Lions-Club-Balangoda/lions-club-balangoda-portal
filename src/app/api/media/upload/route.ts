import { NextRequest, NextResponse } from 'next/server';
import { uploadMediaAsset } from '../../../../lib/media.ts';
import { insertMediaAsset } from '../../../../lib/media-repository.ts';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'lions-balangoda';
    const altText = (formData.get('altText') as string) || undefined;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'No image file provided in upload payload.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file instanceof File ? file.name : 'upload.jpg';

    const result = await uploadMediaAsset(buffer, fileName, {
      folder,
      altText,
    });

    if (!result.success || !result.asset) {
      const statusCode = result.error?.includes('exceeds') ? 413 : 415;
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed.' },
        { status: statusCode }
      );
    }

    // Persist to database
    try {
      insertMediaAsset(result.asset);
    } catch (dbErr) {
      console.warn('[MediaUploadAPI] Warning: Failed to insert asset record to db:', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: result.asset,
        secureUrl: result.secureUrl,
        publicId: result.publicId,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: `Upload error: ${message}` },
      { status: 500 }
    );
  }
}

