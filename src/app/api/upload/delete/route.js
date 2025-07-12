import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export async function POST(req) {
  try {
    // Check authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { publicId } = await req.json();
    
    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 });
    }

    // Delete the image from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // Return the Cloudinary response along with our message
    return NextResponse.json({ 
      message: 'Image deleted successfully',
      result: result 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 });
  }
}