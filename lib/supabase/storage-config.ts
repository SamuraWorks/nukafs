/**
 * Supabase Storage Configuration
 * Sets up secure cloud storage buckets with Row Level Security
 */

import { SupabaseClient } from "@supabase/supabase-js"

export interface StorageBucketConfig {
  name: string
  public: boolean
  allowedMimeTypes: string[]
  maxSizeMB: number
}

export const STORAGE_BUCKETS: Record<string, StorageBucketConfig> = {
  "profile-photos": {
    name: "profile-photos",
    public: false, // Private - accessed via signed URLs
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeMB: 5,
  },
  "student-documents": {
    name: "student-documents",
    public: false,
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSizeMB: 20,
  },
  "stakeholder-documents": {
    name: "stakeholder-documents",
    public: false,
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSizeMB: 20,
  },
  "certificates": {
    name: "certificates",
    public: false,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSizeMB: 10,
  },
  "resumes-cv": {
    name: "resumes-cv",
    public: false,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSizeMB: 15,
  },
}

/**
 * Initialize storage buckets if they don't exist
 * Should be called during app bootstrap
 */
export async function initializeStorageBuckets(
  supabase: SupabaseClient
): Promise<void> {
  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const exists = buckets?.some((b) => b.name === bucket.name)

      if (!exists) {
        // Create bucket
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
        })

        if (error && !error.message.includes("already exists")) {
          console.error(`Failed to create bucket ${bucket.name}:`, error)
        }

        console.log(`Created storage bucket: ${bucket.name}`)
      }
    } catch (error) {
      console.error(`Error initializing bucket ${bucket.name}:`, error)
    }
  }
}

/**
 * Upload file to Supabase Storage
 * Returns signed URL valid for 7 days
 */
export async function uploadToStorage(
  supabase: SupabaseClient,
  bucketName: string,
  userId: string,
  file: File,
  fileName?: string
): Promise<{ url: string; path: string }> {
  const bucket = STORAGE_BUCKETS[bucketName as keyof typeof STORAGE_BUCKETS]

  if (!bucket) {
    throw new Error(`Unknown bucket: ${bucketName}`)
  }

  // Validate file size
  if (file.size > bucket.maxSizeMB * 1024 * 1024) {
    throw new Error(
      `File exceeds maximum size of ${bucket.maxSizeMB}MB`
    )
  }

  // Validate MIME type
  if (!bucket.allowedMimeTypes.includes(file.type)) {
    throw new Error(
      `File type not allowed. Supported: ${bucket.allowedMimeTypes.join(", ")}`
    )
  }

  // Generate path: bucketName/userId/timestamp-filename
  const timestamp = Date.now()
  const path = `${userId}/${timestamp}-${fileName || file.name}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    throw error
  }

  if (!data?.path) {
    throw new Error("Storage upload succeeded but no path was returned.")
  }

  // Generate signed URL (7 day expiry)
  const { data: signedData, error: signedError } =
    await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, 7 * 24 * 60 * 60)

  if (signedError) {
    throw signedError
  }

  if (!signedData?.signedUrl) {
    throw new Error("Failed to generate signed URL for uploaded file.")
  }

  return {
    url: signedData.signedUrl,
    path: data.path,
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(
  supabase: SupabaseClient,
  bucketName: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Delete error in ${bucketName}:`, error)
    return false
  }
}

/**
 * Generate signed URL for existing file
 * Useful for displaying files in the UI
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  bucketName: string,
  path: string,
  expirySeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(path, expirySeconds)

  if (error) {
    throw error
  }

  if (!data?.signedUrl) {
    throw new Error("Failed to generate signed URL")
  }

  return data.signedUrl
}
