import { api } from './api'
import { HppMaterial, HppMaterialDetail, HppRecipe, HppRecipeDetail, HppMaterialFilters, HppRecipeFilters } from '../types/hpp'

export const hppService = {
  /**
   * Get list of all materials with their HPP
   */
  async getHppMaterials(filters?: HppMaterialFilters): Promise<{ data: HppMaterial[] }> {
    const response = await api.get('/hpp/material', { params: filters })
    console.log('Raw API Response:', response.data)
    // Backend returns { data: [...] }, so response.data is already { data: [...] }
    return response.data
  },

  /**
   * Get HPP detail for a specific material
   */
  async getHppMaterial(id: number): Promise<{ data: HppMaterialDetail }> {
    const response = await api.get(`/hpp/material/${id}`)
    return response.data
  },

  /**
   * Get list of all recipes with their HPP
   */
  async getHppRecipes(filters?: HppRecipeFilters): Promise<{ data: HppRecipe[] }> {
    const response = await api.get('/hpp/recipes', { params: filters })
    console.log('Raw API Response:', response.data)
    // Backend returns { data: [...] }, so response.data is already { data: [...] }
    return response.data
  },

  /**
   * Get HPP detail for a specific recipe
   */
  async getHppRecipe(id: number): Promise<{ data: HppRecipeDetail }> {
    const response = await api.get(`/hpp/recipe/${id}`)
    return response.data
  }
}

