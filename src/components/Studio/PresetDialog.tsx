"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronUp, ChevronDown, Clock, Globe, Type, Maximize2, Smile, Upload, Palette, Check } from "lucide-react"
import Image from "next/image"
import { Switch } from "../ui/switch"
import { toast, Toaster } from "sonner"

interface PresetDialogProps {
  user_id: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isRequired?: boolean // If true, user must configure presets before proceeding
  onPresetsConfigured?: () => void // Callback when presets are configured
}

// Define the type for your API responses
interface PresetResponse {
  confirmation: string
  message: string
  data: Preset[]
}

interface UpdateResponse {
  confirmation: string
  message: string
}

// Define the Preset type based on your example
interface PresetSettings {
  line_color: string
  word_color: string
  outline_color: string
  all_caps: boolean
  max_words_per_line: number
  font_size: number
  bold: boolean
  italic: boolean
  underline: boolean
  strikeout: boolean
  style: string
  font_family: string
  position: string
  alignment: string
  spacing: number
  outline_width?: number
  shadow_offset?: number
}

interface Preset {
  name: string
  settings: PresetSettings
  id: string
}

interface UserPresets {
  captions?: Preset;
  [key: string]: any;
}

export default function PresetDialog({ user_id, isOpen, onOpenChange, isRequired = false, onPresetsConfigured }: PresetDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [hasExistingPresets, setHasExistingPresets] = useState<boolean>(false)

  // Caption presets data
  const captionPresets = [
    {
      name: "Rain",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#FFE500",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 4,
        font_size: 38,
        bold: false,
        italic: false,
        underline: false,
        strikeout: false,
        style: "word_by_word",
        font_family: "Shrikhand",
        position: "bottom_center",
        alignment: "center",
        spacing: 2,
      },
      id: "gdrive-five",
    },
    {
      name: "Classic",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#ff69b1",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 6,
        font_size: 38,
        bold: true,
        italic: false,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "Roboto",
        position: "bottom_center",
        alignment: "center",
        spacing: 1,
        outline_width: 1,
        shadow_offset: 1,
      },
      id: "gdrive-five",
    },
    {
      name: "Sara",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#6474FF",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 4,
        font_size: 38,
        bold: false,
        italic: false,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "Luckiest Guy",
        position: "bottom_center",
        alignment: "center",
        outline_width: 1,
        shadow_offset: 1,
      },
      id: "gdrive-five",
    },
    {
      name: "Jimmy",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#ff4f4a",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 5,
        font_size: 46,
        bold: true,
        italic: false,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "Oswald",
        position: "bottom_center",
        alignment: "center",
        outline_width: 3,
        shadow_offset: 2,
      },
      id: "gdrive-five",
    },
    {
      name: "Basker",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#B6FF60",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 5,
        font_size: 46,
        bold: true,
        italic: true,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "Arial",
        position: "bottom_center",
        alignment: "center",
        outline_width: 3,
        shadow_offset: 2,
      },
      id: "gdrive-five",
    },
    {
      name: "Bobby",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#FF7434",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 5,
        font_size: 46,
        bold: true,
        italic: true,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "Comic Neue",
        position: "bottom_center",
        alignment: "center",
        outline_width: 3,
        shadow_offset: 2,
      },
      id: "gdrive-five",
    },
    {
      name: "Beast",
      settings: {
        line_color: "#FFFFFF",
        word_color: "#8253F9",
        outline_color: "#000000",
        all_caps: false,
        max_words_per_line: 5,
        font_size: 46,
        bold: true,
        italic: false,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "Libre Baskerville",
        position: "bottom_center",
        alignment: "center",
        outline_width: 3,
        shadow_offset: 2,
      },
      id: "gdrive-five",
    },
  ]

  // Simple presets list for display
  const presets = captionPresets.map((preset) => ({ name: preset.name }))

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (isOpen) {
          await loadUserPresets(user_id)
        }
      } catch (err) {
        console.error("failed:", err)
        toast.error("Failed to load your presets")
      }
    }
    checkAuthStatus()
  }, [isOpen, user_id])

  // Set selected preset when captions are toggled
  useEffect(() => {
    if (!captionsEnabled) {
      setSelectedPreset(null)
    } else if (selectedPreset === null) {
      setSelectedPreset(0) // Default to first preset when captions are enabled
    }
  }, [captionsEnabled])

  // Function to update user metadata with selected preset
  const updateUserMetadata = async () => {
    if (!user_id) {
      toast.error("User ID is missing. Please log in again.")
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading("Saving your preset...")

    try {
      // API CALL TO GET EXISTING PRESETS
      const response = await fetch("/api/user/getPresets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch existing presets")
      }

      const result: PresetResponse = await response.json()
      const userPresets = result.data as UserPresets

      const newPresets = {
        ...userPresets,
        captions: captionsEnabled && selectedPreset !== null ? captionPresets[selectedPreset] : null,
      }

      const updateResponse = await fetch("/api/user/updatePresets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          newPresets: newPresets,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update presets")
      }

      const updateResult: UpdateResponse = await updateResponse.json()

      if (updateResult.confirmation === "success") {
        toast.dismiss(loadingToast)
        toast.success("Preset saved successfully!")
      }

      // Close dialog after successful update
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating user metadata:", error)
      toast.dismiss(loadingToast)
      toast.error("Failed to save preset. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Load user's existing preset
  const loadUserPresets = async (uid: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/getPresets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: uid,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to load presets")
      }

      const result: PresetResponse = await response.json()
      const userPresets = result.data as UserPresets

      // Check if user has any existing presets
      setHasExistingPresets(userPresets && Object.keys(userPresets).length > 0 && userPresets.captions !== undefined)

      if (userPresets?.captions) {
        // Find matching preset index
        const presetIndex = captionPresets.findIndex((p) => p.name === userPresets.captions?.name)

        if (presetIndex !== -1) {
          setSelectedPreset(presetIndex)
          setCaptionsEnabled(true)
        }
      }
    } catch (error) {
      console.error("Error loading user presets:", error)
      toast.error("Failed to load your presets")
    } finally {
      setIsLoading(false)
    }
  }

  // Apply default presets (first preset with captions enabled)
  const applyDefaultPresets = async () => {
    if (!user_id) {
      toast.error("User ID is missing. Please log in again.")
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading("Applying default presets...")

    try {
      // Get existing presets first
      const response = await fetch("/api/user/getPresets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch existing presets")
      }

      const result: PresetResponse = await response.json()
      const userPresets = result.data as UserPresets

      // Apply default: First caption preset (Rain) with captions enabled
      const defaultPreset = captionPresets[0]
      const newPresets = {
        ...userPresets,
        captions: defaultPreset,
      }

      // Update presets
      const updateResponse = await fetch("/api/user/updatePresets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          newPresets: newPresets,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update presets")
      }

      const updateResult: UpdateResponse = await updateResponse.json()

      if (updateResult.confirmation === "success") {
        toast.dismiss(loadingToast)
        toast.success("Default presets applied successfully!")

        // Update local state
        setSelectedPreset(0)
        setCaptionsEnabled(true)
        setHasExistingPresets(true)

        // Call the callback if provided
        if (onPresetsConfigured) {
          onPresetsConfigured()
        }

        // Close dialog
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error applying default presets:", error)
      toast.dismiss(loadingToast)
      toast.error("Failed to apply default presets. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle save preset button click
  const handleSavePreset = async () => {
    await updateUserMetadata()

    // Call the callback if provided
    if (onPresetsConfigured) {
      onPresetsConfigured()
    }
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <>
      <Toaster position="top-right" />
        
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Prevent closing if required and no presets configured
        if (!open && isRequired && !hasExistingPresets) {
          toast.error("Please configure presets before proceeding", {
            description: "You can use default presets or customize your own",
            duration: 3000,
          })
          return
        }
        onOpenChange(open)
      }}>
        <DialogTrigger asChild>{/* Trigger button is handled externally */}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-3 bg-white dark:bg-black border-gray-800 dark:border-gray-700 rounded-xl shadow-lg">
          <div className="p-6">

            {/* Header Section */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {isRequired && !hasExistingPresets ? "Configure Presets to Continue" : "Choose Your Style"}
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRequired && !hasExistingPresets
                  ? "Before launching the plugin, please configure your presets. You can use our default settings or customize your own."
                  : "Select from our professionally designed presets or customize your own"
                }
              </p>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              
              {/* Presets Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Caption Styles</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable Captions</span>
                    <Switch
                      checked={captionsEnabled}
                      onCheckedChange={setCaptionsEnabled}
                      className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {presets.map((preset, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer ${!captionsEnabled ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => captionsEnabled && setSelectedPreset(index)}
                    >
                      <div className="relative">
                        <div
                          className={`w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 transition-all duration-200 border-2 ${
                            selectedPreset === index && captionsEnabled
                              ? "border-black dark:border-white shadow-lg"
                              : "border-gray-500 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="w-full h-full relative bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={`/Style${index + 1}.png`}
                              alt={preset.name}
                              fill
                              className="object-cover"
                            />
                            
                            {/* Selection indicator */}
                            {selectedPreset === index && captionsEnabled && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white dark:text-black" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <span className={`text-sm font-medium ${
                            selectedPreset === index && captionsEnabled
                              ? "text-black dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {preset.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings Sections */}
              <div className="space-y-4">
                
                {/* Duration Section */}
                <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Duration</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Target duration for each clip</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg font-medium border border-orange-300 dark:border-orange-600">
                        1 min
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original Language Section */}
                <div className="rounded-xl border-2 border-gray-500 dark:border-gray-600 bg-white dark:bg-gray-800">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl"
                    onClick={() => toggleSection('language')}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Original Language</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Detect and process original audio language</p>
                        </div>
                      </div>
                      {expandedSections.language ? 
                        <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </div>
                  </div>
                  {expandedSections.language && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Additional language settings would go here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Advanced Section */}
                <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-purple-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Advanced processing options</p>
                      </div>
                    </div>
                    <Switch className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white" />
                  </div>
                </div>

                {/* Dimension Section */}
                <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Maximize2 className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dimension</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Video aspect ratio</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium border border-green-300 dark:border-green-600">
                      9:16
                    </div>
                  </div>
                </div>

                {/* Emojis Section */}
                <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Smile className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Emojis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate relevant emojis</p>
                      </div>
                    </div>
                    <Switch className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white" />
                  </div>
                </div>

                {/* Auto Uploads Section */}
                <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-indigo-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Auto Uploads</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically upload generated clips to all socials
                        </p>
                      </div>
                    </div>
                    <Switch className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center gap-3">
              <div className="flex gap-3">
                {!hasExistingPresets && (
                  <Button
                    className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-6"
                    onClick={applyDefaultPresets}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Applying...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Use Default Presets
                      </div>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                {!isRequired && (
                  <Button
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 px-6"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-gray-100 px-6"
                  onClick={handleSavePreset}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Preset"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}