import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardsProps {
  cdData: {
    descarga: number
    congelado: number
    resfriado: number
    kitFesta: number
  }
  statusData: {
    descarga: number
    patio: number
    finalizado: number
  }
}

export function DashboardCards({ cdData, statusData }: DashboardCardsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="shadow-md bg-card-descarga-cd text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descarga (CD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cdData.descarga}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-card-congelado-cd text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Congelado (CD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cdData.congelado}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-card-resfriado-cd text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resfriado (CD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cdData.resfriado}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-card-kitfesta-cd text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kit Festa / Festivo (CD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cdData.kitFesta}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-4">Status dos Veículos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="shadow-md bg-card-descarga-status text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descarga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.descarga}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-card-patio-status text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pátio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.patio}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-card-finalizado-status text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.finalizado}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
