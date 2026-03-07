"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateAppointmentDialog } from "@/components/create-appointment-dialog"
import { EditAppointmentDialog } from "@/components/edit-appointment-dialog"
import Link from "next/link"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [filterDoctor, setFilterDoctor] = useState("all")
  const [filterMonth, setFilterMonth] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const fetchAppointments = async () => {
    try {
      const [apptsRes, meRes, docsRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/auth/me"),
        fetch("/api/doctors")
      ])
      const apptsData = await apptsRes.json()
      const meData = await meRes.json()
      const docsData = await docsRes.json()

      setAppointments(Array.isArray(apptsData) ? apptsData : [])
      if (meRes.ok) setUser(meData.user)
      setDoctors(Array.isArray(docsData) ? docsData : [])
    } catch (error) {
      console.error("Failed to fetch appointments data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status: newStatus }),
      })
      if (res.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error("Failed to update appointment status:", error)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [filterDoctor, filterMonth])

  const filteredAppointments = appointments.filter(a => {
    let match = true
    if (filterDoctor !== "all" && a.doctor !== filterDoctor) match = false
    if (filterMonth !== "all" && a.date) {
      const month = a.date.split("-")[1]
      if (month !== filterMonth) match = false
    }
    return match
  })

  const stats = {
    total: filteredAppointments.length,
    scheduled: filteredAppointments.filter(a => a.status === "Scheduled" || a.status === "Confirmed").length,
    completed: filteredAppointments.filter(a => a.status === "Completed").length
  }

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage))
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <main className="relative flex-1 min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-900/20">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="blob top-[-10%] left-[-10%]" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="container relative py-10 px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Appointments</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Schedule and manage patient appointments</p>
        </div>

        {/* Appointment Stats */}
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          <Card className="group relative overflow-hidden border-none bg-blue-500/10 dark:bg-blue-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-[0.2em]">Total Appointments</CardTitle>
              <div className="p-2.5 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-500/20">
                <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black tracking-tight text-blue-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.total}</div>
              <p className="text-xs font-medium text-blue-700/70 dark:text-blue-300/70 mt-3">This month</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none bg-emerald-500/10 dark:bg-emerald-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 via-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.2em]">Scheduled</CardTitle>
              <div className="p-2.5 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-500/20">
                <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black tracking-tight text-emerald-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.scheduled}</div>
              <p className="text-xs font-medium text-emerald-700/70 dark:text-emerald-300/70 mt-3">Upcoming</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none bg-amber-500/10 dark:bg-amber-600/20 backdrop-blur-xl border-t border-l border-white/40 dark:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/20 via-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-[0.2em]">Completed</CardTitle>
              <div className="p-2.5 bg-amber-500/20 dark:bg-amber-400/20 rounded-xl group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-amber-500/20">
                <Loader2 className="h-5 w-5 text-amber-700 dark:text-amber-300 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="text-4xl font-black tracking-tight text-amber-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{stats.completed}</div>
              <p className="text-xs font-medium text-amber-700/70 dark:text-amber-300/70 mt-3">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="glass-premium rounded-3xl p-8 hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Appointments</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chronological overview of scheduled visits</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {user && (user.role === "ADMIN" || user.role === "STAFF") && (
                <>
                  <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                    <SelectTrigger className="w-[160px] bg-white/50 dark:bg-slate-900/50">
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {doctors.map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[140px] bg-white/50 dark:bg-slate-900/50">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      <SelectItem value="01">January</SelectItem>
                      <SelectItem value="02">February</SelectItem>
                      <SelectItem value="03">March</SelectItem>
                      <SelectItem value="04">April</SelectItem>
                      <SelectItem value="05">May</SelectItem>
                      <SelectItem value="06">June</SelectItem>
                      <SelectItem value="07">July</SelectItem>
                      <SelectItem value="08">August</SelectItem>
                      <SelectItem value="09">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              <CreateAppointmentDialog onSuccess={fetchAppointments}>
                <Button className="rounded-xl px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform">
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Appointment
                </Button>
              </CreateAppointmentDialog>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden bg-white/30 dark:bg-slate-950/30">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow className="hover:bg-transparent border-slate-200/50 dark:border-slate-800/50">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Patient Name</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">OPD NO</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Time</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Doctor</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Specialty</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-12 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAppointments.length > 0 ? (
                      paginatedAppointments.map((apt) => (
                        <TableRow key={apt._id || apt.id} className="group hover:bg-slate-500/5 transition-colors border-slate-200/50 dark:border-slate-800/50">
                          <TableCell className="font-bold text-slate-900 dark:text-white py-4">
                            <Link href={`/patients/${apt.patientId}`} className="hover:underline hover:text-blue-600 transition-colors duration-200">
                              {apt.patientName}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-slate-500 py-4">{apt.patientId}</TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" />
                              {apt.date}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                              {apt.time}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-sm text-slate-700 dark:text-slate-200 py-4">{apt.doctor}</TableCell>
                          <TableCell className="py-4">
                            {apt.specialty ? (
                              <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50 text-[10px] font-bold rounded-lg px-2">
                                {apt.specialty}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-800 rounded-lg px-2">{apt.type}</Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Select
                              defaultValue={apt.status}
                              onValueChange={(val) => handleStatusChange(apt._id, val)}
                            >
                              <SelectTrigger className={`h-8 w-[110px] text-[10px] font-black uppercase tracking-wider rounded-lg border-none ${apt.status === "Completed" ? "bg-emerald-500/10 text-emerald-700" :
                                apt.status === "Cancelled" ? "bg-rose-500/10 text-rose-700" :
                                  "bg-blue-500/10 text-blue-700"
                                }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <EditAppointmentDialog appointment={apt} onSuccess={fetchAppointments}>
                              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest">
                                Edit
                              </Button>
                            </EditAppointmentDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-slate-500 py-12 font-medium">
                          No upcoming appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredAppointments.length)}</span> of <span className="font-bold">{filteredAppointments.length}</span> appointments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border-slate-200 dark:border-slate-800"
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 w-20 text-center">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border-slate-200 dark:border-slate-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
