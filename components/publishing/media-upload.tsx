"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  isValidMediaType,
  isValidMediaSize,
  getMediaValidationError,
  MAX_MEDIA_FILE_SIZE,
  ALLOWED_MEDIA_EXTENSIONS,
} from "@/lib/constants/opportunities-announcements"

export interface MediaUploadProps {
  label: string
  description?: string
  onFileSelected: (file: File | null, preview: string | null) => void
  currentPreviewUrl?: string
  accept?: string
  required?: boolean
  className?: string
}

export function MediaUpload({
  label,
  description,
  onFileSelected,
  currentPreviewUrl,
  accept = ".jpg,.jpeg,.png,.pdf",
  required = false,
  className = "",
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentPreviewUrl || null)
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = getMediaValidationError(file)
    if (error) {
      toast.error(error)
      return
    }

    setFileName(file.name)
    setIsLoading(true)

    // Create preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string
        setPreview(previewUrl)
        onFileSelected(file, previewUrl)
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } else if (file.type === "application/pdf") {
      setPreview(null)
      onFileSelected(file, null)
      setIsLoading(false)
      toast.success(`PDF uploaded: ${file.name}`)
    } else {
      setIsLoading(false)
      toast.error("Unsupported file type")
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFileName("")
    onFileSelected(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isPdf = fileName.endsWith(".pdf")

  return (
    <div className={className}>
      <div className="mb-2">
        <label className="text-sm font-semibold">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>

      {preview || fileName ? (
        <Card className="p-4 bg-card/50 border-dashed">
          <div className="flex items-start gap-4">
            {isPdf ? (
              <div className="flex size-16 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <FileText className="size-8" />
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : null}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isPdf ? "PDF Document" : "Image"}
              </p>
              {!isLoading && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemove}
                  className="mt-2 text-destructive hover:text-destructive"
                >
                  <X className="size-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />

          <Upload className="mx-auto size-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            {isLoading ? "Uploading..." : "Drop file here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported: {ALLOWED_MEDIA_EXTENSIONS.join(", ")} (max {MAX_MEDIA_FILE_SIZE / 1024 / 1024}MB)
          </p>
        </div>
      )}
    </div>
  )
}
