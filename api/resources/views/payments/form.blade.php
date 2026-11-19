<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>Pago · Coders Free</title>
    <script
        src="{{ $staticUrl }}/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
        kr-public-key="{{ $publicKey }}"
        kr-post-url-success="{{ $responseUrl }}"
        kr-post-url-refused="{{ $responseUrl }}"
        kr-language="es-ES">
    </script>
    <link rel="stylesheet" href="{{ $staticUrl }}/static/js/krypton-client/V4.0/ext/neon-reset.min.css">
    <script src="{{ $staticUrl }}/static/js/krypton-client/V4.0/ext/neon.js"></script>
    <style>
        body { margin: 0; padding: 20px 16px; background: #0B1A23; color: #F2F7F8; font-family: system-ui, sans-serif; }
        .resumen { margin: 0 0 16px; font-size: 15px; color: #B8C7CF; }
        .resumen strong { color: #F2F7F8; }
        .monto { color: #22D3EE; font-weight: 700; }
        .kr-embedded { margin: 0 auto; }
        .kr-embedded .kr-payment-button { background-color: #FF8A3D !important; color: #0B1A23 !important; }
    </style>
</head>
<body>
    <p class="resumen"><strong>{{ $order->course->title }}</strong> · <span class="monto">S/ {{ $order->amount }}</span></p>
    <div class="kr-embedded" kr-form-token="{{ $order->form_token }}"></div>
    <script>
        // Un pago rechazado se queda en el formulario de Izipay; se avisa a la app para que muestre el motivo.
        // Los errores de validación de los campos (CLIENT_…) solo se muestran en el formulario.
        (function bindErrors() {
            if (!window.KR) {
                return setTimeout(bindErrors, 100);
            }
            KR.onError(function (event) {
                if (!/^(ACQ|PSP)_/.test(event.errorCode || '') || !window.ReactNativeWebView) {
                    return;
                }
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'payment-result',
                    status: 'rejected',
                    message: event.detailedErrorMessage || event.errorMessage || 'El banco rechazó el pago.',
                    orderId: {{ $order->id }}
                }));
            });
        })();
    </script>
</body>
</html>
