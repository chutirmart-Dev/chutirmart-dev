<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\ConversionTrackingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendMetaPurchaseEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(public Order $order) {}

    /**
     * Execute the job.
     */
    public function handle(ConversionTrackingService $service): void
    {
        $service->trackPurchase($this->order);
    }
}
