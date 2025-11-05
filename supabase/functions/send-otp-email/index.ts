import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  name: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: SendOTPRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Generating OTP for email:", email);

    // Generate OTP
    const otpCode = generateOTP();
    
    // Store OTP in database with 10-minute expiry
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing unverified OTPs for this email
    await supabase
      .from("email_verification_otps")
      .delete()
      .eq("email", email)
      .eq("verified", false);

    const { error: insertError } = await supabase
      .from("email_verification_otps")
      .insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to store OTP");
    }

    console.log("OTP stored successfully, sending email...");

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "Lavera HMS <onboarding@resend.dev>",
      to: [email],
      subject: "Your Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Lavera HMS${name ? ', ' + name : ''}!</h1>
          <p style="font-size: 16px; color: #666;">Thank you for signing up. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 30px 0;">
            <h2 style="font-size: 32px; letter-spacing: 8px; color: #333; margin: 0;">${otpCode}</h2>
          </div>
          <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #999;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">Lavera Hospital Management System</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send OTP",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
