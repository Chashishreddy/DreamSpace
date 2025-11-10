import sharp from 'sharp';

async function stripMetadata(buffer) {
  return sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
}

async function callStabilityAPI(imageBuffer, prompt, style) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('STABILITY_API_KEY is not configured on the server.');
  }

  const formData = new FormData();
  formData.append('prompt', `${prompt} interior design, professional photo, ${style} style`);
  formData.append('image', new Blob([imageBuffer]), 'room.png');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/png',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const message = `Stability API error (${response.status}): ${errorText}`;
    throw new Error(message);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function redesignRoom(req, res, next) {
  try {
    const { prompt, style } = req.body;
    if (!prompt || !style) {
      return res.status(400).json({ message: 'Prompt and style are required.' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const sanitizedImage = await stripMetadata(req.file.buffer);
    const stabilityResponse = await callStabilityAPI(sanitizedImage, prompt, style);

    res.setHeader('Content-Type', 'image/png');
    res.send(stabilityResponse);
  } catch (error) {
    next(error);
  }
}
