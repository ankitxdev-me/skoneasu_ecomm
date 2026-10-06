'use client'

import { useState, useEffect } from 'react'
import { adminAPI, socialAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Share2,
  Eye,
  CheckCircle2,
  Loader2,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

// Custom Pinterest SVG Icon
function PinterestIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  )
}

const DEFAULT_LINKS = {
  instagram: 'https://www.instagram.com/the.skoneasu?igsh=YjBqcHRmdzJscnp0',
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  pinterest: 'https://pinterest.com',
  youtube: 'https://youtube.com',
  whatsapp: 'https://wa.me/919999999999'
}

export default function SocialSettingsPage() {
  const [links, setLinks] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    pinterest: '',
    youtube: '',
    whatsapp: ''
  })
  const [visibility, setVisibility] = useState({
    instagram: true,
    facebook: true,
    twitter: true,
    pinterest: true,
    youtube: true,
    whatsapp: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await socialAPI.get()
      if (data) {
        setLinks({
          instagram: data.instagram || DEFAULT_LINKS.instagram,
          facebook: data.facebook || DEFAULT_LINKS.facebook,
          twitter: data.twitter || DEFAULT_LINKS.twitter,
          pinterest: data.pinterest || DEFAULT_LINKS.pinterest,
          youtube: data.youtube || DEFAULT_LINKS.youtube,
          whatsapp: data.whatsapp || DEFAULT_LINKS.whatsapp
        })
        if (data._visibility) {
          setVisibility(prev => ({ ...prev, ...data._visibility }))
        }
      }
    } catch (err) {
      console.error('Failed to load social settings:', err)
      setLinks(DEFAULT_LINKS)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (platform, value) => {
    setLinks(prev => ({ ...prev, [platform]: value }))
    setHasChanges(true)
  }

  const handleToggle = (platform, checked) => {
    setVisibility(prev => ({ ...prev, [platform]: checked }))
    setHasChanges(true)
  }

  const handleReset = () => {
    setLinks(DEFAULT_LINKS)
    setVisibility({
      instagram: true,
      facebook: true,
      twitter: true,
      pinterest: true,
      youtube: true,
      whatsapp: false
    })
    setHasChanges(true)
    toast.info('Reset to default official links')
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        ...links,
        _visibility: visibility
      }
      await socialAPI.update(payload)
      setHasChanges(false)
      toast.success('Social media links saved successfully!')
    } catch (err) {
      console.error('Save failed:', err)
      toast.error(err.message || 'Failed to save social media settings')
    } finally {
      setSaving(false)
    }
  }

  const testLink = (url) => {
    if (!url) return
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    window.open(finalUrl, '_blank', 'noopener,noreferrer')
  }

  const platforms = [
    {
      key: 'instagram',
      name: 'Instagram',
      handle: '@the.skoneasu',
      icon: Instagram,
      iconColor: 'text-[#E1306C]',
      badgeColor: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white',
      placeholder: 'https://www.instagram.com/the.skoneasu'
    },
    {
      key: 'facebook',
      name: 'Facebook',
      handle: 'skoneasuofficial',
      icon: Facebook,
      iconColor: 'text-[#1877F2]',
      badgeColor: 'bg-[#1877F2] text-white',
      placeholder: 'https://facebook.com/your-brand'
    },
    {
      key: 'twitter',
      name: 'Twitter / X',
      handle: '@skoneasu',
      icon: Twitter,
      iconColor: 'text-neutral-900',
      badgeColor: 'bg-black text-white',
      placeholder: 'https://twitter.com/your-brand'
    },
    {
      key: 'pinterest',
      name: 'Pinterest',
      handle: 'pinterest/skoneasu',
      icon: PinterestIcon,
      iconColor: 'text-[#E60023]',
      badgeColor: 'bg-[#E60023] text-white',
      placeholder: 'https://pinterest.com/your-brand'
    },
    {
      key: 'youtube',
      name: 'YouTube',
      handle: '@skoneasugifts',
      icon: Youtube,
      iconColor: 'text-[#FF0000]',
      badgeColor: 'bg-[#FF0000] text-white',
      placeholder: 'https://youtube.com/@your-channel'
    },
    {
      key: 'whatsapp',
      name: 'WhatsApp Support',
      handle: 'Direct Chat',
      icon: Globe,
      iconColor: 'text-[#25D366]',
      badgeColor: 'bg-[#25D366] text-white',
      placeholder: 'https://wa.me/919999999999'
    }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#B87545]" />
        <p className="text-sm text-neutral-500 font-medium">Loading social media configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-serif font-bold text-neutral-900">Social Media Interface</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-normal text-xs py-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Live Store Sync
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">
            Manage official brand social links shown in the storefront footer and social icons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 border-neutral-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-1.5 text-xs bg-[#2D1B16] hover:bg-[#1E110B] text-white shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-neutral-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#B87545]" />
                    Social Channels &amp; URLs
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 mt-0.5">
                    Enter the full URL or username for each platform. Toggle visibility to show or hide in the footer.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-neutral-100">
              {platforms.map((p) => {
                const IconComponent = p.icon
                const isVisible = visibility[p.key] !== false
                const value = links[p.key] || ''

                return (
                  <div key={p.key} className="py-4 first:pt-1 last:pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <IconComponent className={`w-4 h-4 ${p.iconColor}`} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5 cursor-pointer">
                            {p.name}
                            <span className="text-[10px] text-neutral-400 font-normal">({p.handle})</span>
                          </Label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          {isVisible ? 'Visible' : 'Hidden'}
                        </span>
                        <Switch
                          checked={isVisible}
                          onCheckedChange={(checked) => handleToggle(p.key, checked)}
                          aria-label={`Toggle ${p.name}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex-1">
                        <Input
                          type="url"
                          value={value}
                          onChange={(e) => handleChange(p.key, e.target.value)}
                          placeholder={p.placeholder}
                          className="text-xs h-9 font-mono pr-8 bg-neutral-50/50 focus:bg-white"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => testLink(value)}
                        disabled={!value}
                        title="Open link in new tab"
                        className="h-9 w-9 p-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Storefront Footer Preview */}
        <div className="space-y-4">
          <Card className="border-neutral-200/80 shadow-xs sticky top-4">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#B87545]" />
                Live Footer Preview
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Real-time preview of how social icons appear in the store footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              
              {/* Dark Footer Simulation Card */}
              <div className="rounded-xl bg-[#1E110B] p-5 text-white border border-[#3E2417] shadow-inner space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif font-bold text-sm tracking-wider text-[#FAF5EE]">SKONEASU</span>
                    <Badge className="bg-[#44281B] text-[#D5C0B3] border-none text-[9px] px-1.5 py-0">Gifting</Badge>
                  </div>
                  <p className="text-[#CDB5A6] text-[11px] leading-relaxed font-sans line-clamp-2">
                    Perfect Gifts For Him, Her &amp; Everyone. Thoughtfully curated to celebrate relationships.
                  </p>
                </div>

                {/* The Circular Social Buttons (Exactly matching Footer.js) */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A68F81] font-semibold block mb-2.5">
                    Follow Our Story
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {visibility.instagram !== false && (
                      <a
                        href={links.instagram || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-110"
                        title={links.instagram || 'Instagram'}
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}

                    {visibility.facebook !== false && (
                      <a
                        href={links.facebook || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-110"
                        title={links.facebook || 'Facebook'}
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}

                    {visibility.twitter !== false && (
                      <a
                        href={links.twitter || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-110"
                        title={links.twitter || 'Twitter / X'}
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}

                    {visibility.pinterest !== false && (
                      <a
                        href={links.pinterest || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-110"
                        title={links.pinterest || 'Pinterest'}
                      >
                        <PinterestIcon className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {visibility.youtube !== false && (
                      <a
                        href={links.youtube || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-110"
                        title={links.youtube || 'YouTube'}
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#341C11] flex items-center justify-between text-[10px] text-[#A68F81]">
                  <span>Status: Configured</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Footer Active
                  </span>
                </div>
              </div>

              {/* Instructions Tip */}
              <div className="mt-4 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-[#B87545]">
                  <Sparkles className="w-3.5 h-3.5" /> Quick Tip
                </p>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Links updated here automatically update the official footer buttons on both Desktop and Mobile views. Click &quot;Save Changes&quot; to apply.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
