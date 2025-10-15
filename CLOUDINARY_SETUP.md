# Cloudinary Setup Guide

Your SPARK application now uses **Cloudinary** for cloud file storage instead of local storage. This allows PDFs and videos to be accessible from any computer!

## What Changed?

- **Before**: Files were stored in `server/uploads` folder on your local computer
- **After**: Files are uploaded to Cloudinary's cloud servers and can be accessed from anywhere

## Setup Instructions

### Step 1: Create a Free Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Click "Sign Up For Free"
3. Create an account (it's completely free for up to 25GB storage)
4. After signing up, you'll be taken to your Dashboard

### Step 2: Get Your Cloudinary Credentials

On your Cloudinary Dashboard, you'll see:
- **Cloud Name**: e.g., `dxxxxxx`
- **API Key**: e.g., `123456789012345`
- **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz` (click "Reveal" to see it)

### Step 3: Configure Cloudinary Security Settings

**IMPORTANT:** You need to disable "Strict Transformations" to allow signed URL access to raw files (PDFs).

1. Go to your Cloudinary Dashboard
2. Click on **Settings** (gear icon) in the top right
3. Go to the **Security** tab
4. Scroll down to **Restricted media types**
5. Find **"Strict transformations"** and **UNCHECK** it (make sure it's disabled)
6. Click **Save** at the bottom

### Step 4: Update Your .env File

Open `server/.env` and replace the placeholders with your actual credentials:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dz3k5abcd
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=ABcDefGhIjKlMnOpQrStUvWxYz123
```

### Step 5: Restart Your Server

After updating the `.env` file:

```bash
cd server
npm start
```

## Testing the Setup

1. **Upload a PDF**: Go to the teacher dashboard and upload a material (PDF or video)
2. **Check Cloudinary**:
   - Go to your Cloudinary dashboard
   - Click "Media Library" in the left sidebar
   - You should see your uploaded files in folders: `spark/pdfs` or `spark/videos`
3. **Test from Another Computer**: Have your friend open the app on their computer
   - They should be able to see, view, and download the PDF!

## How It Works

1. When a teacher uploads a PDF/video, it's sent to Cloudinary's servers
2. Cloudinary stores the file and returns a public URL (e.g., `https://res.cloudinary.com/...`)
3. This URL is saved in your MongoDB database
4. When students view materials, they get the Cloudinary URL
5. Anyone can access the file using that URL - no matter which computer they're on!

## Important Notes

- **Free Tier Limits**:
  - 25GB storage
  - 25GB bandwidth/month
  - This should be enough for educational use

- **Old Local Files**: Files uploaded before this change are still in `server/uploads` and will continue to work as before. New uploads will use Cloudinary.

- **Security**: Your API credentials in `.env` are secret. Never share them or commit the `.env` file to GitHub!

## Troubleshooting

### "Upload failed" error
- Check that your Cloudinary credentials in `.env` are correct
- Make sure you restarted the server after updating `.env`
- Check the server console/terminal for detailed error messages

### Files still not accessible on friend's PC
- Make sure your friend is using the latest code
- Verify the file was uploaded AFTER you set up Cloudinary (check Cloudinary dashboard)
- Check browser console for error messages

### "Invalid credentials" error
- Double-check your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- Make sure there are no spaces or quotes around the values

### "Failed to load PDF document" error OR "deny or ACL failure"
- **Most Common:** Go to Cloudinary Dashboard → Settings → Security → Disable "Strict transformations"
- Check server console logs for detailed error messages
- Verify the file exists in Cloudinary Media Library
- Try accessing the Cloudinary URL directly in browser to test if it works
- Make sure the server has `axios` installed: `cd server && npm install`

### PDF prompts download instead of viewing
- This should be fixed with the proxy route
- If still happening, check server logs for errors in `/api/materials/view/:id` route
- Verify the browser supports inline PDF viewing (most modern browsers do)

## Need Help?

- Cloudinary Documentation: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- Check the Cloudinary Dashboard for upload logs and errors
