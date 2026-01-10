# Supabase Project Setup

This guide provides instructions for setting up a hosted Supabase project for the SafeSpaceApp.

## 1. Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com) and sign in.
2.  Click on "New project" and select your organization.
3.  Enter a name for your project (e.g., "SafeSpaceApp").
4.  Generate a secure database password and save it in a safe place.
5.  Choose the region closest to your users.
6.  Click "Create project".

## 2. Set Up the Database

1.  After linking your project, run the following command to apply the database migrations:
    ```bash
    npx supabase db reset
    ```
2.  This command will create all the necessary tables in your database.

## 3. Configure Authentication

1.  Go to the "Authentication" section in your Supabase project.
2.  Under "Configuration", select "Providers".
3.  Enable the "Email" provider. You can also enable other providers like Google, but you will need to provide the necessary credentials.
4.  (Optional) Customize the email templates for confirmation, password reset, etc.

## 4. Environment Variables

1.  In the Supabase project settings, go to "API".
2.  You will find the Project URL and the `anon` public key.
3.  Create a `.env` file in the root of your React Native project.
4.  Add the following environment variables to your `.env` file:

    ```
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

5.  Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the values from your Supabase project.

## 5. Set Up Supabase Functions

This project uses Supabase Edge Functions. To deploy them, you will need to have the Supabase CLI installed and configured.

1.  Install the Supabase CLI:
    ```bash
    npm i supabase --save-dev --legacy-peer-deps
    ```
2.  Log in to the Supabase CLI:
    ```bash
    npx supabase login
    ```
3.  Link your local project to your hosted Supabase project:
    ```bash
    npx supabase link --project-ref YOUR_PROJECT_ID
    ```
    You can find your `PROJECT_ID` in the URL of your Supabase project dashboard.
4.  Deploy the functions:
    ```bash
    npx supabase functions deploy
    ```

Your Supabase project is now configured and ready to use with the SafeSpaceApp.
