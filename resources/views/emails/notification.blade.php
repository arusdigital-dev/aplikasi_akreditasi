<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $notification->title }}</title>
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .data-section {
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .data-section h3 {
            margin-top: 0;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $notification->title }}</h1>
    </div>
    <div class="content">
        <p>Halo {{ $user->name }},</p>
        
        <div style="white-space: pre-line;">{{ $notification->message }}</div>

        @if($notification->data && !empty($notification->data))
        <div class="data-section">
            <h3>Detail Informasi:</h3>
            <ul>
                @foreach($notification->data as $key => $value)
                    @if(is_array($value))
                        <li><strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong>
                            <ul>
                                @foreach($value as $item)
                                    <li>{{ $item }}</li>
                                @endforeach
                            </ul>
                        </li>
                    @else
                        <li><strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong> {{ $value }}</li>
                    @endif
                @endforeach
            </ul>
        </div>
        @endif

        <a href="{{ config('app.url') }}/dashboard" class="button">Buka Dashboard</a>
    </div>
    <div class="footer">
        <p>Email ini dikirim secara otomatis dari Sistem Aplikasi Akreditasi UMRAH.</p>
        <p>Jika Anda tidak mengharapkan email ini, silakan abaikan.</p>
    </div>
</body>
</html>
