import React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Loader2 } from "lucide-react"

const Toaster = ({ theme: propTheme, ...props }: ToasterProps) => {
  const { theme: currentTheme } = useTheme()
  // Default to 'light' for storefront so toasts are crisp, high contrast, and readable
  const resolvedTheme = propTheme || currentTheme || "light"

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group font-bangla"
      icons={{
        success: (
          <CheckCircle2 className="w-5 h-5 text-[#009E49] shrink-0" />
        ),
        info: (
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
        ),
        warning: (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        ),
        error: (
          <AlertCircle className="w-5 h-5 text-[#E2231A] shrink-0" />
        ),
        loading: (
          <Loader2 className="w-5 h-5 animate-spin text-[#009E49] shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "font-bangla text-base font-bold shadow-xl rounded-xl",
          title: "font-bangla text-[15px] font-bold",
          description: "font-bangla text-[13.5px] font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
