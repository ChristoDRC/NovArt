"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, ImagePlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type Product,
  type Category,
} from "@/lib/products"

// Página de dashboard para administradores
export default function DashboardPage() {
  // Estados para gestionar productos y categorías
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    stock: 0,
    featured: false,
  })

  const { user, isAdmin } = useAuth()
  const router = useRouter()

  // Efecto para cargar productos y categorías
  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificamos si el usuario es administrador
        if (!isAdmin) {
          router.push("/")
          return
        }

        // Cargamos productos y categorías
        const productsData = await getProducts()
        const categoriesData = await getCategories()

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAdmin, router])

  // Función para editar un producto
  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      stock: product.stock,
      featured: product.featured,
    })
    setImagePreview(product.image_url)
    setIsEditing(true)
  }

  // Función para eliminar un producto
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        const success = await deleteProduct(id)

        if (success) {
          setProducts(products.filter((product) => product.id !== id))
          toast({
            title: "Producto eliminado",
            description: "El producto ha sido eliminado correctamente",
          })
        } else {
          throw new Error("No se pudo eliminar el producto")
        }
      } catch (error) {
        console.error("Error al eliminar producto:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      }
    }
  }

  // Función para añadir un nuevo producto
  const handleAdd = () => {
    setCurrentProduct(null)
    setFormData({
      name: "",
      description: "",
      price: 0,
      category_id: categories.length > 0 ? categories[0].id : "",
      stock: 0,
      featured: false,
    })
    setImagePreview(null)
    setImageFile(null)
    setIsEditing(true)
  }

  // Función para manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number.parseFloat(value) : value,
    })
  }

  // Función para manejar cambios en el selector de categoría
  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category_id: value,
    })
  }

  // Función para manejar la selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Creamos una vista previa de la imagen
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let imageUrl = currentProduct?.image_url || "/placeholder.svg?height=300&width=300"

      // Si hay una nueva imagen, la subimos
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      if (currentProduct) {
        // Actualizamos un producto existente
        const updatedProduct = await updateProduct(currentProduct.id, {
          ...formData,
          image_url: imageUrl,
        })

        if (updatedProduct) {
          setProducts(
            products.map((product) =>
              product.id === currentProduct.id
                ? {
                    ...updatedProduct,
                    category_name: categories.find((c) => c.id === updatedProduct.category_id)?.name,
                  }
                : product,
            ),
          )

          toast({
            title: "Producto actualizado",
            description: "El producto ha sido actualizado correctamente",
          })
        }
      } else {
        // Creamos un nuevo producto
        const newProduct = await createProduct({
          ...formData,
          image_url: imageUrl,
        })

        if (newProduct) {
          setProducts([
            {
              ...newProduct,
              category_name: categories.find((c) => c.id === newProduct.category_id)?.name,
            },
            ...products,
          ])

          toast({
            title: "Producto creado",
            description: "El producto ha sido creado correctamente",
          })
        }
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    }
  }

  // Si está cargando, mostramos un indicador
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy">Panel de Administración de Productos</h1>
          <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Añadir Producto
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[100px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.featured ? "Sí" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      className="text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {currentProduct ? "Editar Producto" : "Añadir Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                {currentProduct
                  ? "Actualiza los detalles del producto a continuación."
                  : "Completa los detalles para el nuevo producto."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoría
                  </Label>
                  <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="featured" className="text-right">
                    Destacado
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 mr-2"
                    />
                    <Label htmlFor="featured">Marcar como producto destacado</Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="image" className="text-right pt-2">
                    Imagen
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image")?.click()}
                        className="flex items-center gap-2"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Seleccionar imagen
                      </Button>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      {imagePreview && (
                        <div className="relative w-16 h-16">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Vista previa"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {currentProduct ? "Actualizar" : "Añadir"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

