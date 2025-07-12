import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { validateUserInput } from '@/lib/validation/userValidation';

export async function POST(request) {
  try {
    // 1) Parse & validate incoming JSON
    const payload = await request.json();
    const userData = validateUserInput(payload);
    const { name, email, password, role } = userData;

    // 2) Connect to MongoDB via Mongoose
    await dbConnect();

    // 3) Check for existing email
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // 4) Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5) Determine role (Zod has already defaulted it, but here’s an example override)
    const isAdminEmail = email.endsWith('.admin@gmail.com');
    const finalRole = isAdminEmail ? 'admin' : role;

    // 6) Create & save user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      // other fields (notifications, counters, etc.) will use your schema defaults
    });

    // 7) Strip out sensitive data before replying
    const safeUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      questionsAsked: newUser.questionsAsked,
      answersGiven: newUser.answersGiven,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { message: 'User created successfully', user: safeUser },
      { status: 201 }
    );
  } catch (err) {
    // 400–level: validation errors
    if (err instanceof ZodError) {
      const fieldErrors = err.flatten().fieldErrors;
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }
    // 409: duplicate key elsewhere
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { error: `${dupField} already in use` },
        { status: 409 }
      );
    }
    // 500: fallback
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
