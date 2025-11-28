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
            width: 200px;
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
        .readiness-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px;
            margin: 20px 0;
        }
        .readiness-box h3 {
            margin-top: 0;
            color: #22c55e;
        }
        .risk-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 10px 0;
        }
        .risk-box h4 {
            margin-top: 0;
            color: #ef4444;
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
        <h3>Statistik Keseluruhan</h3>
        <div class="info-row">
            <span class="info-label">Total Program:</span>
            <span class="info-value">{{ $overall_stats['total_programs'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Standar:</span>
            <span class="info-value">{{ $overall_stats['total_standards'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Kriteria:</span>
            <span class="info-value">{{ $overall_stats['total_criteria'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Penugasan:</span>
            <span class="info-value">{{ $overall_stats['total_assignments'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Penugasan Selesai:</span>
            <span class="info-value">{{ $overall_stats['completed_assignments'] }}</span>
        </div>
    </div>

    <div class="readiness-box">
        <h3>Skor Kesiapan Akreditasi</h3>
        <div style="font-size: 24pt; font-weight: bold; color: #22c55e; text-align: center; padding: 20px;">
            {{ $readiness_score }}%
        </div>
    </div>

    @if(count($risks) > 0)
        <h3>Risiko Utama</h3>
        @foreach($risks as $risk)
            <div class="risk-box">
                <h4>
                    @if($risk['severity'] === 'high')
                        ⚠️ Risiko Tinggi
                    @else
                        ⚡ Risiko Sedang
                    @endif
                </h4>
                <p><strong>Program:</strong> {{ $risk['program'] }}</p>
                <p>{{ $risk['message'] }}</p>
            </div>
        @endforeach
    @endif

    <h3>Detail Program</h3>
    <table>
        <thead>
            <tr>
                <th>Program</th>
                <th>Fakultas</th>
                <th>Standar</th>
                <th>Kriteria</th>
                <th>Penugasan</th>
                <th>Selesai</th>
            </tr>
        </thead>
        <tbody>
            @foreach($programs as $program)
                <tr>
                    <td>{{ $program->name }}</td>
                    <td>{{ $program->fakultas }}</td>
                    <td>{{ $program->standards->count() }}</td>
                    <td>{{ $program->standards->sum(fn($s) => $s->criteria->count()) }}</td>
                    <td>{{ $program->standards->sum(fn($s) => $s->criteria->sum(fn($c) => $c->assignments->count())) }}</td>
                    <td>{{ $program->standards->sum(fn($s) => $s->criteria->sum(fn($c) => $c->assignments->where('status', \App\Models\AssignmentStatus::Completed)->count())) }}</td>
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

