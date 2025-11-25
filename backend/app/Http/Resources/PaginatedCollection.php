<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class PaginatedCollection extends ResourceCollection
{
    protected $pagination;

    public function __construct($resource, $pagination = null)
    {
        parent::__construct($resource);
        $this->pagination = $pagination;
    }

    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection,
            'meta' => $this->pagination ? [
                'total' => $this->pagination['total'],
                'per_page' => $this->pagination['per_page'],
                'current_page' => $this->pagination['current_page'],
                'last_page' => $this->pagination['last_page'],
                'from' => $this->pagination['from'],
                'to' => $this->pagination['to'],
            ] : [
                'total' => $this->collection->count(),
                'per_page' => null,
                'current_page' => 1,
                'last_page' => 1,
                'from' => 1,
                'to' => $this->collection->count(),
            ]
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function with($request)
    {
        return [
            'success' => true,
            'message' => 'Data retrieved successfully'
        ];
    }
}
