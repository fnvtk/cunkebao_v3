"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface TrafficTeam {
  id: string
  name: string
  commission: number
}

interface TrafficTeamSettingsProps {
  formData: any
  onChange: (data: any) => void
}

export function TrafficTeamSettings({ formData, onChange }: TrafficTeamSettingsProps) {
  const [teams, setTeams] = useState<TrafficTeam[]>(formData.trafficTeams || [])
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TrafficTeam | null>(null)
  const [newTeam, setNewTeam] = useState<Partial<TrafficTeam>>({
    name: "",
    commission: 0,
  })

  const handleAddTeam = () => {
    if (!newTeam.name) return

    if (editingTeam) {
      setTeams(teams.map((team) => (team.id === editingTeam.id ? { ...team, ...newTeam } : team)))
    } else {
      setTeams([
        ...teams,
        {
          id: Date.now().toString(),
          name: newTeam.name,
          commission: newTeam.commission || 0,
        } as TrafficTeam,
      ])
    }

    setIsAddTeamOpen(false)
    setNewTeam({ name: "", commission: 0 })
    setEditingTeam(null)
    onChange({ ...formData, trafficTeams: teams })
  }

  const handleEditTeam = (team: TrafficTeam) => {
    setEditingTeam(team)
    setNewTeam(team)
    setIsAddTeamOpen(true)
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter((team) => team.id !== teamId))
    onChange({ ...formData, trafficTeams: teams.filter((team) => team.id !== teamId) })
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">打粉团队设置</h2>
          <Button onClick={() => setIsAddTeamOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加团队
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>团队名称</TableHead>
                <TableHead>佣金比例</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.commission}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTeam(team)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTeam(team.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "编辑团队" : "添加团队"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>团队名称</Label>
              <Input
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="请输入团队名称"
              />
            </div>
            <div className="space-y-2">
              <Label>佣金比例 (%)</Label>
              <Input
                type="number"
                value={newTeam.commission}
                onChange={(e) => setNewTeam({ ...newTeam, commission: Number(e.target.value) })}
                placeholder="请输入佣金比例"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddTeam}>{editingTeam ? "保存" : "添加"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

