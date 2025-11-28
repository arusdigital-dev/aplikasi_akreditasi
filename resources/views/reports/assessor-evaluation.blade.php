<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 2cm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563EB;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 18pt;
            color: #2563EB;
        }
        .header .subtitle {
            font-size: 10pt;
            color: #64748b;
            margin-top: 5px;
        }
        .info-section {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 5px;
        }
        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        .info-label {
            display: table-cell;
            width: 150px;
            font-weight: bold;
            color: #0f172a;
        }
        .info-value {
            display: table-cell;
            color: #64748b;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #2563EB;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .summary-box {
            background-color: #eff6ff;
            border-left: 4px solid #2563EB;
            padding: 15px;
            margin: 20px 0;
        }
        .summary-box h3 {
            margin-top: 0;
            color: #2563EB;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #64748b;
        }
        .qr-code {
            float: right;
            margin: 10px;
        }
        .qr-code img {
            width: 100px;
            height: 100px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="qr-code">
            @if(isset($qr_code))
                <img src="{{ public_path($qr_code) }}" alt="QR Code">
            @endif
        </div>
        <h1>UNIVERSITAS MARITIM RAJA ALI HAJI</h1>
        <div class="subtitle">Lembaga Penjaminan Mutu dan Pengembangan Pendidikan</div>
        <h2>{{ $title }}</h2>
    </div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Tanggal Dibuat:</span>
            <span class="info-value">{{ $generated_at }}</span>
        </div>
    </div>

    <div class="summary-box">
        <h3>Ringkasan Evaluasi</h3>
        <div class="info-row">
            <span class="info-label">Total Evaluasi:</span>
            <span class="info-value">{{ $summary['total_evaluations'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Skor:</span>
            <span class="info-value">{{ number_format($summary['total_score'], 2) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Rata-rata Skor:</span>
            <span class="info-value"><strong>{{ number_format($summary['average_score'], 2) }}</strong></span>
        </div>
    </div>

    <h3>Penilaian per Asesor</h3>
    <table>
        <thead>
            <tr>
                <th>Nama Asesor</th>
                <th>Total Evaluasi</th>
                <th>Total Skor</th>
                <th>Rata-rata Skor</th>
            </tr>
        </thead>
        <tbody>
            @foreach($summary['assessors'] as $assessor)
                <tr>
                    <td>{{ $assessor['name'] }}</td>
                    <td>{{ $assessor['total_evaluations'] }}</td>
                    <td>{{ number_format($assessor['total_score'], 2) }}</td>
                    <td>{{ number_format($assessor['average_score'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h3>Detail Evaluasi</h3>
    <table>
        <thead>
            <tr>
                <th>Program</th>
                <th>Kriteria</th>
                <th>Asesor</th>
                <th>Unit</th>
                <th>Skor</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($evaluations as $evaluation)
                <tr>
                    <td>{{ $evaluation->assignment->criterion->standard->program->name ?? 'N/A' }}</td>
                    <td>{{ $evaluation->assignment->criterion->name ?? 'N/A' }}</td>
                    <td>{{ $evaluation->assignment->assessor->name ?? 'N/A' }}</td>
                    <td>{{ $evaluation->assignment->unit->name ?? 'N/A' }}</td>
                    <td>{{ number_format($evaluation->score, 2) }}</td>
                    <td>{{ Str::limit($evaluation->notes ?? '-', 50) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Dokumen ini dihasilkan secara otomatis oleh Sistem Aplikasi Akreditasi UMRAH</p>
        <p>Untuk validasi, scan QR Code yang terdapat pada dokumen ini</p>
    </div>
</body>
</html>

