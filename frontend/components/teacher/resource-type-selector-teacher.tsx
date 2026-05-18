"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CourseResourceType, ResourceItem } from "@/app/domain/entities/CourseEntities"
import { fetchResourceTypesMock } from "@/app/domain/services/serviceCourse"

interface PropsSelectorTipoRecurso {
  open: boolean
  onClose: () => void
  onSelect: (type: CourseResourceType) => void
}


export function ResourceTypeSelector({ open, onClose, onSelect }: PropsSelectorTipoRecurso) {
  const [itemsRecurso, setItemsRecurso] = useState<ResourceItem[]>([]); // Estado para los datos obtenidos
  const [cargando, setCargando] = useState(true);
  const [consultaBusqueda, setConsultaBusqueda] = useState("");
  const [filtro, setFiltro] = useState("all");

  useEffect(() => {
    const cargarTiposRecurso = async () => {
      setCargando(true);
      const datos = await fetchResourceTypesMock(); 
      setItemsRecurso(datos);
      setCargando(false);
    };
    cargarTiposRecurso();
  }, []);


  const recursosFiltrados = itemsRecurso.filter((recurso) => {
    const coincideBusqueda = recurso.name.toLowerCase().includes(consultaBusqueda.toLowerCase());
    const coincideFiltro = filtro === "all" || recurso.id === filtro;
    return coincideBusqueda && coincideFiltro;
  });
return (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
          Agregar una Actividad o Recurso
        </DialogTitle>
      </DialogHeader>

      {cargando ? (
        <div className="flex-1 flex items-center justify-center text-primary">
          <p className="text-sm sm:text-base">Cargando opciones de recursos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 overflow-y-auto flex-1 pb-4">
          {recursosFiltrados.map((recurso) => {
            const Icono = recurso.icon;
            return (
              <button
                key={recurso.id}
                onClick={() => onSelect(recurso.type)}
                className="border border-border rounded-lg p-4 sm:p-6 text-center hover:shadow-lg hover:border-primary transition-all bg-card group"
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icono />
                  </div>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2">
                  {recurso.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {recurso.description}
                </p>
              </button>
            );
          })}
          {recursosFiltrados.length === 0 && (
            <div className="sm:col-span-2 text-center text-muted-foreground pt-8">
              <p className="text-sm">No hay recursos que coincidan con tus criterios.</p>
            </div>
          )}
        </div>
      )}
    </DialogContent>
  </Dialog>
);
}