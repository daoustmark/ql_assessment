const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createVideoBucket() {
  try {
    console.log('🗄️ Creating assessment-videos bucket...')
    
    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('assessment-videos', {
        public: true,
        allowedMimeTypes: ['video/webm', 'video/mp4', 'video/quicktime'],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
      })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket already exists')
      } else {
        throw bucketError
      }
    } else {
      console.log('✅ Bucket created successfully:', bucket)
    }

    // Create storage policies
    console.log('🔐 Creating storage policies...')
    
    // Policy for authenticated users to upload
    const uploadPolicy = `
      CREATE POLICY IF NOT EXISTS "Allow authenticated video upload" 
      ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'assessment-videos');
    `

    // Policy for public access to download videos
    const downloadPolicy = `
      CREATE POLICY IF NOT EXISTS "Allow public video access"
      ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'assessment-videos');
    `

    // Execute policies
    const { error: uploadPolicyError } = await supabase.rpc('exec_sql', { 
      sql: uploadPolicy 
    })
    
    if (uploadPolicyError) {
      console.log('Upload policy may already exist or RLS policies need manual setup')
    } else {
      console.log('✅ Upload policy created')
    }

    const { error: downloadPolicyError } = await supabase.rpc('exec_sql', { 
      sql: downloadPolicy 
    })
    
    if (downloadPolicyError) {
      console.log('Download policy may already exist or RLS policies need manual setup')
    } else {
      console.log('✅ Download policy created')
    }

    console.log('🎉 Video storage setup complete!')
    console.log('\nManual steps if policies failed:')
    console.log('1. Go to Supabase Dashboard → Storage → assessment-videos')
    console.log('2. Add these policies manually:')
    console.log('\nUpload Policy:')
    console.log(uploadPolicy)
    console.log('\nDownload Policy:')
    console.log(downloadPolicy)

  } catch (error) {
    console.error('❌ Error setting up video storage:', error)
    console.log('\nPlease create the bucket manually:')
    console.log('1. Go to Supabase Dashboard → Storage')
    console.log('2. Create bucket: assessment-videos (Public)')
    console.log('3. Add upload/download policies as shown above')
  }
}

createVideoBucket() 