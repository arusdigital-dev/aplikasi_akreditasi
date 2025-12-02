<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Laporan Eksekutif' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0;
            font-size: 10px;
        }
        .content {
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title ?? 'Laporan Eksekutif' }}</h1>
        <p>Universitas Maritim Raja Ali Haji</p>
        <p>Dibuat pada: {{ $generated_at ?? now()->format('d F Y H:i:s') }}</p>
    </div>

    <div class="content">
        <p>Laporan ini berisi informasi akreditasi universitas.</p>
    </div>

    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh Sistem Aplikasi Akreditasi</p>
        <p>Halaman {PAGENO} dari {PAGETOTAL}</p>
    </div>
</body>
</html>



