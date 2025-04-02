"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Video, Play } from "lucide-react"
import { getPageTutorials } from "@/lib/tutorials"
import type { TutorialVideo } from "@/types/tutorial"

export function AIAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null)

  useEffect(() => {
    // 获取当前页面的教程视频
    const pageTutorials = getPageTutorials(pathname)
    setTutorials(pageTutorials)
    setSelectedVideo(pageTutorials[0] || null)
  }, [pathname])

  const handleOpenDialog = () => {
    setIsOpen(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-50 border z-50"
          onClick={handleOpenDialog}
        >
          <Video className="h-5 w-5 text-gray-600" />
        </Button>
        <DialogContent className="sm:max-w-[640px] p-0">
          <ScrollArea className="h-[480px]">
            <div className="space-y-4">
              {selectedVideo ? (
                <div>
                  <div className="aspect-video bg-gray-900 relative">
                    <img
                      src={selectedVideo.thumbnailUrl || "/placeholder.svg"}
                      alt={selectedVideo.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20"
                      >
                        <Play className="h-8 w-8 text-white" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedVideo.description}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">暂无该页面的教程视频</div>
              )}

              {tutorials.length > 1 && (
                <div className="p-4 border-t">
                  <h4 className="font-medium mb-4">更多教程视频</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {tutorials
                      .filter((video) => video.id !== selectedVideo?.id)
                      .map((video) => (
                        <div
                          key={video.id}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedVideo(video)}
                        >
                          <div className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden">
                            <img
                              src={video.thumbnailUrl || "/placeholder.svg"}
                              alt={video.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <h5 className="text-sm font-medium mt-2">{video.title}</h5>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

