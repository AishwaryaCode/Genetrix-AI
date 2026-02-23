
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Thumbnail from "../models/Thumbnail.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

/* -------- STYLE MAP (MATCHES MODEL) -------- */
const stylePrompts: Record<string, string> = {
  "Bold & Graphic": "bold graphic design, high contrast, large typography",
  "Tech/Futuristic": "futuristic tech style, neon lights, modern UI",
  "Minimalist": "minimal clean design, simple background",
  "Photorealistic": "photorealistic, ultra high detail, DSLR quality",
  "Illustrated": "digital illustration, creative artwork",
};

/* -------- COLOR MAP -------- */
const colorPrompts: Record<string, string> = {
  vibrant: "vibrant colors, eye-catching",
  sunset: "warm sunset tones, orange and pink",
  forest: "green forest tones, natural look",
  neon: "neon glowing colors",
  purple: "purple aesthetic tones",
  monochrome: "black and white, monochrome",
  ocean: "blue ocean tones",
  pastel: "soft pastel colors",
};

/* ---------------- GENERATE THUMBNAIL ---------------- */
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session as any;

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    if (!title || !style) {
      return res.status(400).json({ message: "Title and style are required" });
    }

    /* -------- CREATE DB ENTRY -------- */
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    /* -------- BUILD FINAL PROMPT -------- */
    let finalPrompt = `YouTube thumbnail for "${title}". `;

    if (stylePrompts[style]) {
      finalPrompt += stylePrompts[style] + ". ";
    }

    if (color_scheme && colorPrompts[color_scheme]) {
      finalPrompt += colorPrompts[color_scheme] + ". ";
    }

    if (user_prompt) {
      finalPrompt += user_prompt + ". ";
    }

    if (text_overlay) {
      finalPrompt += `Include bold readable text saying "${text_overlay}". `;
    }

    finalPrompt += `Aspect ratio ${aspect_ratio || "16:9"}, professional, high contrast, ultra sharp.`;

    console.log("Generating image from HuggingFace...");
    console.log("Prompt:", finalPrompt);


    /*         GENERATE IMAGE USING HUGGINGFACE              */
    

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        inputs: finalPrompt,
        parameters: {
          width: 1024,
          height: 1024,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        responseType: "arraybuffer",
      }
    );

    const imageBuffer = Buffer.from(response.data);

    console.log("Image generated successfully");
    /* -------- SAVE TEMP FILE -------- */
    const filename = `thumbnail-${Date.now()}.png`;
    const imagesDir = path.join(process.cwd(), "images");
    const filePath = path.join(imagesDir, filename);

    fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(filePath, imageBuffer);

    /* -------- UPLOAD TO CLOUDINARY -------- */
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "thumbnails",
    });

    fs.unlinkSync(filePath);

    /* -------- UPDATE DB -------- */
    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.prompt_used = finalPrompt;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.json({
      message: "Thumbnail generated successfully 🎉",
      thumbnail,
    });
  } catch (error: any) {
    console.error(error);
    res.status(503).json({
      message: "Image generation service temporarily unavailable",
    });
  }
};

/* ---------------- DELETE THUMBNAIL ---------------- */
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session as any;

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
