<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Resultado del pago · Coders Free</title>
    <style>
        body { margin: 0; padding: 40px 16px; background: #0B1A23; color: #F2F7F8; font-family: system-ui, sans-serif; text-align: center; }
    </style>
</head>
<body>
    <p>{{ $message }}</p>
    <script>
        // La app recibe el resultado y muestra su propia pantalla; luego consulta el pedido a la API.
        (function () {
            var result = {{ \Illuminate\Support\Js::from($result) }};
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(result));
            }
        })();
    </script>
</body>
</html>
