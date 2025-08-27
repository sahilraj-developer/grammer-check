"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deepSeekService } from "@/lib/deepseek-service"

interface ApiSettingsProps {
  onConfigChange?: (configured: boolean) => void
}

export function ApiSettings({ onConfigChange }: ApiSettingsProps) {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem("deepseek_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      deepSeekService.setConfig({
        apiKey: savedKey,
        baseUrl: "https://api.deepseek.com",
      })
      setIsConfigured(true)
      onConfigChange?.(true)
    }
  }, [onConfigChange])

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your DeepSeek API key",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("deepseek_api_key", apiKey)
    deepSeekService.setConfig({
      apiKey: apiKey,
      baseUrl: "https://api.deepseek.com",
    })
    setIsConfigured(true)
    onConfigChange?.(true)

    toast({
      title: "API Key Saved",
      description: "DeepSeek API has been configured successfully",
    })
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) return

    setIsTesting(true)
    try {
      await deepSeekService.correctGrammar("Test sentence for API connection.")
      toast({
        title: "Connection Successful",
        description: "DeepSeek API is working correctly",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your API key and try again",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleRemoveApiKey = () => {
    localStorage.removeItem("deepseek_api_key")
    setApiKey("")
    setIsConfigured(false)
    onConfigChange?.(false)
    toast({
      title: "API Key Removed",
      description: "DeepSeek API configuration has been cleared",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          DeepSeek API Configuration
          {isConfigured ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Configure your DeepSeek API key for advanced AI-powered grammar correction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to get your DeepSeek API key:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>
                Visit{" "}
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  platform.deepseek.com <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new API key</li>
              <li>Copy and paste it below</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="api-key">DeepSeek API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
              Save
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection} disabled={!apiKey.trim() || isTesting}>
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
          {isConfigured && (
            <Button variant="destructive" onClick={handleRemoveApiKey}>
              Remove API Key
            </Button>
          )}
        </div>

        {!isConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Without an API key, the app will use mock responses for demonstration. Add your DeepSeek API key for real
              AI-powered grammar correction.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
