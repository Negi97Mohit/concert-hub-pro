# Remix of Concert Hub Pro

this is my publi github:
https://github.com/Negi97Mohit/alexandra-s-concert-hub-9f57a56f.git
allow user to rearrange images using drag to change the order, give a perviwe of all the sections, so that they can get a live feed of how it will look

the amin username an passwors are: SicMundus & ILovaRamen
in the main amin page w/o login add a home btn so they can go to the home page,

also in the photos admin section,

show the upload photo bn when the user tries to add a new photo

in the more info btn, allow amin to add more text description aswell, not just a url, showw the text when the user clicks the  more infor btn,

show the photos in the admin page so that user know which photos they are editing

allow user to change the photos in other sections as well like the main page,biography page, allow user to choose the frame for the pictures, whther the should fit, stretch, fill or centre, show the dimensions of the image needed as well

when the admin tries to add a new value they see the input field on the way to the top, move the btn to the top as well so that the user sees the input fields

allow user to rearrange images using drag to change the order, give a perviwe of all the sections, so that they can get a live feed of how it will look

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

## Netlify Deployment

1. **Push to GitHub / GitLab / Bitbucket**:
   Ensure all changes are committed and pushed to your git repository.

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
   - Select your Git provider and choose this repository.

3. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/client`
   - **Functions directory**: `.netlify/functions-internal` (auto-configured via Nitro/netlify.toml)

4. **Environment Variables**:
   Add the following in your Netlify site settings (**Site configuration** > **Environment variables**):
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/publishable key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server actions/admin)
   - `ADMIN_USERNAME`: Admin login username
   - `ADMIN_PASSWORD`: Admin login password
   - `ADMIN_COOKIE_SECRET`: A secure random 32+ character string for signing session cookies

