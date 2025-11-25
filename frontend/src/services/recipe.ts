import { api } from './api'
import { Recipe, RecipeFilters, RecipeCostCalculation, Product, Material } from '../types/recipe'
import { PaginatedResponse } from '../types/api'

export const recipeService = {
  async getRecipes(filters?: RecipeFilters): Promise<PaginatedResponse<Recipe>> {
    const response = await api.get('/recipes', { params: filters })
    return response.data
  },

  async getRecipe(id: number): Promise<Recipe> {
    const response = await api.get(`/recipes/${id}`)
    return response.data.data
  },

  async createRecipe(recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
    const response = await api.post('/recipes', recipeData)
    return response.data.data
  },

  async updateRecipe(id: number, recipeData: Partial<Recipe>): Promise<Recipe> {
    const response = await api.put(`/recipes/${id}`, recipeData)
    return response.data.data
  },

  async deleteRecipe(id: number): Promise<void> {
    await api.delete(`/recipes/${id}`)
  },

  async calculateRecipeCost(id: number): Promise<RecipeCostCalculation> {
    const response = await api.get(`/recipes/${id}/calculate-cost`)
    return response.data
  },

  async getProducts(): Promise<Product[]> {
    const response = await api.get('/recipes/products/list')
    return response.data.data
  },

  async getMaterials(): Promise<Material[]> {
    const response = await api.get('/recipes/materials/list')
    return response.data.data
  }
}
