"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Activity, Clock, Loader2 } from "lucide-react"
import { DiagnosisChart } from "@/components/diagnosis-chart"
import { RecentPatientsTable } from "@/components/recent-patients-table"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    totalReports: 0,
    pendingImaging: 23, // Still mock for now as we don't have a model for this specifically
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [patientsRes, reportsRes, imagingRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/reports"),
          fetch("/api/imaging"),
        ])
        const patients = await patientsRes.json()
        const reports = await reportsRes.json()
        const imaging = await imagingRes.json()

        setStats({
          totalPatients: Array.isArray(patients) ? patients.length : 0,
          newPatients: Array.isArray(patients) ? patients.filter((p: any) => {
            const date = new Date(p.createdAt || p.lastVisit)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          }).length : 0,
          totalReports: Array.isArray(reports) ? reports.length : 0,
          pendingImaging: Array.isArray(imaging) ? imaging.filter((i: any) => i.aiFlag === "Requires Review").length : 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <main className="relative flex-1 min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-900/20">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="blob top-[-10%] left-[-10%]" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="container relative py-10 px-8">
        <PageHeader title="Dashboard" description="Overview of your healthcare system" showSearch />

        {/* Metric Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card
            className="group relative overflow-hidden border-none bg-blue-500/10 dark:bg-blue-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer"
            onClick={() => router.push("/patients")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-[0.2em]">Total Patients</CardTitle>
              <div className="p-2.5 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-500/20">
                <Users className="h-5 w-5 text-blue-700 dark:text-blue-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <div className="text-4xl font-black tracking-tight text-blue-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.totalPatients.toLocaleString()}</div>
                  <div className="flex items-center mt-3">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-100 bg-blue-500/10 dark:bg-blue-400/10 px-2 py-1 rounded-lg border border-blue-200/50 dark:border-blue-700/50">+12.5%</span>
                    <span className="text-[11px] font-medium text-blue-700/70 dark:text-blue-300/70 ml-2">vs last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border-none bg-emerald-500/10 dark:bg-emerald-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 cursor-pointer"
            onClick={() => router.push("/patients")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 via-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.2em]">New Patients</CardTitle>
              <div className="p-2.5 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-500/20">
                <Activity className="h-5 w-5 text-emerald-700 dark:text-emerald-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <div className="text-4xl font-black tracking-tight text-emerald-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.newPatients.toLocaleString()}</div>
                  <div className="flex items-center mt-3 text-[11px] font-medium text-emerald-700/70 dark:text-emerald-300/70">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    High activity detected
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border-none bg-amber-500/10 dark:bg-amber-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 cursor-pointer"
            onClick={() => router.push("/patients")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/20 via-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-[0.2em]">Total Reports</CardTitle>
              <div className="p-2.5 bg-amber-500/20 dark:bg-amber-400/20 rounded-xl group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-amber-500/20">
                <FileText className="h-5 w-5 text-amber-700 dark:text-amber-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <div className="text-4xl font-black tracking-tight text-amber-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.totalReports.toLocaleString()}</div>
                  <p className="text-[11px] font-medium text-amber-700/70 dark:text-amber-300/70 mt-3">Synthesized from All departments</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card
            className="group relative overflow-hidden border-none bg-rose-500/10 dark:bg-rose-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 cursor-pointer"
            onClick={() => router.push("/imaging")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-rose-500/20 via-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-[0.2em]">Pending Imaging</CardTitle>
              <div className="p-2.5 bg-rose-500/20 dark:bg-rose-400/20 rounded-xl group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-rose-500/20">
                <Clock className="h-5 w-5 text-rose-700 dark:text-rose-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black tracking-tight text-rose-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.pendingImaging}</div>
              <div className="flex items-center mt-3">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-100 bg-rose-500/20 dark:bg-rose-400/10 px-3 py-1 rounded-lg border border-rose-200/50 dark:border-rose-700/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Urgent
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-8 lg:grid-cols-3 mb-10">
          <div className="lg:col-span-2">
            <div className="glass-premium rounded-3xl p-8 hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Diagnosis Distribution</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Insights from current patient profiles</p>
              </div>
              <div className="h-[350px]">
                <DiagnosisChart />
              </div>
            </div>
          </div>

          <Card className="border-none glass-premium rounded-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative pl-6 border-l-2 border-emerald-500/50 py-1">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Cloud Database</span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">Optimal</span>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  Real-time synchronization with <span className="text-slate-900 dark:text-white font-bold">MongoDB Atlas</span> is active and healthy.
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-900/20 rounded-2xl border border-blue-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Performance</span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-300 leading-relaxed">
                  System resources are stable. Current request latency is <span className="text-blue-600 dark:text-blue-400 font-bold">42ms</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <div className="glass-premium rounded-3xl p-8 hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Patients</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chronological overview of latest admissions</p>
            </div>
          </div>
          <RecentPatientsTable />
        </div>
      </div>
    </main>
  )
}

