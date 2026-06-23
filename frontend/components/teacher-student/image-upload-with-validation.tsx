"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, AlertCircle, Check } from 'lucide-react';


const validarFirmaImagen = (archivo: File): Promise<{ valid: boolean; type: string }> => {
  return new Promise((resolve, reject) => {
    const lectorArchivo = new FileReader();

    lectorArchivo.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      let cabecera = "";
      for (let i = 0; i < arr.length; i++) {
        cabecera += arr[i].toString(16).toUpperCase().padStart(2, '0');
      }

      let tipo = "unknown";
      
      switch (cabecera) {
        case "89504E47": // PNG
          tipo = "image/png";
          break;
        case "FFD8FFDB":
        case "FFD8FFE0":
        case "FFD8FFEE":
        case "FFD8FFE1":
          tipo = "image/jpeg";
          break;
        case "47494638":
          tipo = "image/gif";
          break;
        default:
          if (cabecera.startsWith("52494646")) {
            tipo = "image/webp";
          }
          break;
      }

      if (tipo !== "unknown") {
        resolve({ valid: true, type: tipo });
      } else {
        resolve({ valid: false, type: "unknown" });
      }
    };

    lectorArchivo.onerror = () => reject(new Error("Error al leer el archivo"));
    lectorArchivo.readAsArrayBuffer(archivo.slice(0, 4));
  });
};


interface PropsSubidaImagenConValidacion {
  currentImageUrl?: string;
  onImageChange: (datosImagen: { file: File; previewUrl: string; validationType: string } | null) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUploadWithValidation({ 
  currentImageUrl = "", 
  onImageChange,
  label = "Imagen de la Unidad",
  className = "",
  disabled = false
}: PropsSubidaImagenConValidacion) {
  const [urlVistaPrevia, setUrlVistaPrevia] = useState(currentImageUrl);
  const [estadoValidacion, setEstadoValidacion] = useState<'valid' | 'invalid' | null>(null);
  const [error, setError] = useState("");
  const [validando, setValidando] = useState(false);
  const referenciaInputArchivo = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUrlVistaPrevia(currentImageUrl);
  }, [currentImageUrl]);

  const handleSeleccionArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    
    if (!archivo) {
      return;
    }

    setError("");
    setEstadoValidacion(null);
    setValidando(true);

    const tamanoMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamanoMaximo) {
      setError("El tamaño del archivo debe ser menor a 5MB");
      setValidando(false);
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      setError("El archivo debe ser una imagen");
      setValidando(false);
      return;
    }

    try {
      const validacion = await validarFirmaImagen(archivo);
      
      if (!validacion.valid) {
        setError("Archivo de imagen inválido o corrupto");
        setEstadoValidacion("invalid");
        setValidando(false);
        return;
      }

      const lector = new FileReader();
      lector.onloadend = () => {
        const dataUrl = lector.result as string;
        setUrlVistaPrevia(dataUrl);
        setEstadoValidacion("valid");
        setValidando(false);
        
        if (onImageChange) {
          onImageChange({ 
            file: archivo, 
            previewUrl: dataUrl,
            validationType: validacion.type 
          });
        }
      };
      lector.readAsDataURL(archivo);

    } catch (err) {
      setError("Error al validar la imagen");
      setEstadoValidacion("invalid");
      setValidando(false);
    }
  };

  const handleEliminarImagen = () => {
    setUrlVistaPrevia("");
    setEstadoValidacion(null);
    setError("");
    if (referenciaInputArchivo.current) {
      referenciaInputArchivo.current.value = "";
    }
    if (onImageChange) {
      onImageChange(null);
    }
  };

  const handleClickSubir = () => {
    if (!disabled) {
      referenciaInputArchivo.current?.click();
    }
  };
return (
  <div className={`space-y-3 ${className}`}>
    <label className="block text-sm font-medium text-foreground">
      {label}
    </label>

    <div className="relative">
      {urlVistaPrevia ? (
        <div className="relative group">
          <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-border bg-secondary">
            <img
              src={urlVistaPrevia}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClickSubir}
                  className="px-4 py-2 bg-card text-foreground rounded-lg font-medium hover:bg-secondary transition-colors flex items-center gap-2 border border-border"
                >
                  <Upload className="h-4 w-4" />
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleEliminarImagen}
                  className="px-4 py-2 bg-destructive text-white rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>

          {estadoValidacion === "valid" && (
            <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check className="h-3 w-3" />
              Imagen Verificada
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClickSubir}
          disabled={disabled}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors bg-secondary/50 flex flex-col items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
            <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-foreground mb-1">
              Haz clic para subir imagen
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF, WEBP hasta 5MB
            </p>
          </div>
        </button>
      )}
    </div>

    <input
      ref={referenciaInputArchivo}
      type="file"
      accept="image/png, image/jpeg, image/gif, image/webp"
      onChange={handleSeleccionArchivo}
      disabled={disabled}
      className="hidden"
    />

    {validando && (
      <div className="flex items-center gap-2 text-sm text-primary">
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        Validando imagen...
      </div>
    )}

    {error && (
      <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
          <p className="text-xs text-destructive/80 mt-1">
            Por favor, seleccione un archivo de imagen válido
          </p>
        </div>
      </div>
    )}

    <p className="text-xs text-muted-foreground">
      Las imágenes se validan mediante firmas binarias por seguridad
    </p>
  </div>
);
}