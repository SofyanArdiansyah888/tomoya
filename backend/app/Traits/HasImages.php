<?php

namespace App\Traits;

trait HasImages
{
    /**
     * Get the image for the model
     */
    public function getImageAttribute()
    {
        return $this->gambar;
    }

    /**
     * Set the image for the model
     */
    public function setImage($path)
    {
        $this->update(['gambar' => $path]);
        return $this;
    }

    /**
     * Remove the image from the model
     */
    public function removeImage()
    {
        $this->update(['gambar' => null]);
        return $this;
    }

    /**
     * Check if the model has an image
     */
    public function hasImage()
    {
        return !empty($this->gambar);
    }
}
