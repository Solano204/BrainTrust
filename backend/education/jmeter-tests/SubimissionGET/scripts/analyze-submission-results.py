# scripts/analyze-submission-results.py
import pandas as pd
import numpy as np
import sys
from datetime import datetime

def analyze_submission_results(csv_file):
    """Análisis especializado para resultados del endpoint GET /submissions/{id}"""

    print("=" * 80)
    print("📊 ANÁLISIS ESPECÍFICO - GET /api/submissions/{id}")
    print("=" * 80)

    df = pd.read_csv(csv_file)

    # Métricas específicas para este endpoint
    total_requests = len(df)
    success_rate = (df['success'] == True).mean() * 100
    avg_response_time = df['elapsed'].mean()
    p95_response_time = df['elapsed'].quantile(0.95)

    # Throughput
    duration = (df['timeStamp'].max() - df['timeStamp'].min()) / 1000
    throughput = total_requests / duration if duration > 0 else 0

    print(f"\n📈 MÉTRICAS DEL ENDPOINT:")
    print(f"   Total Requests:      {total_requests:,}")
    print(f"   Success Rate:        {success_rate:.2f}%")
    print(f"   Avg Response Time:   {avg_response_time:.2f}ms")
    print(f"   95th Percentile:     {p95_response_time:.2f}ms")
    print(f"   Throughput:          {throughput:.2f} req/sec")
    print(f"   Test Duration:       {duration:.2f} seconds")

    # Evaluación específica para este endpoint
    print(f"\n🎯 EVALUACIÓN ESPECÍFICA:")

    # Response Time Evaluation
    if p95_response_time < 100:
        print("   ✅ Response Time: EXCELENTE (< 100ms)")
    elif p95_response_time < 200:
        print("   ✅ Response Time: BUENO (< 200ms)")
    elif p95_response_time < 500:
        print("   ⚠️  Response Time: ACEPTABLE (< 500ms)")
    else:
        print("   ❌ Response Time: PROBLEMA (> 500ms)")

    # Success Rate Evaluation
    if success_rate >= 99.9:
        print("   ✅ Success Rate: EXCELENTE (> 99.9%)")
    elif success_rate >= 99:
        print("   ✅ Success Rate: BUENO (> 99%)")
    elif success_rate >= 95:
        print("   ⚠️  Success Rate: ACEPTABLE (> 95%)")
    else:
        print("   ❌ Success Rate: CRÍTICO (< 95%)")

    # Throughput Evaluation
    if throughput > 1000:
        print("   ✅ Throughput: EXCELENTE (> 1000 req/sec)")
    elif throughput > 500:
        print("   ✅ Throughput: BUENO (> 500 req/sec)")
    elif throughput > 100:
        print("   ⚠️  Throughput: ACEPTABLE (> 100 req/sec)")
    else:
        print("   ❌ Throughput: BAJO (< 100 req/sec)")

    # Análisis de errores específicos
    error_df = df[df['success'] == False]
    if not error_df.empty:
        print(f"\n🔍 ANÁLISIS DE ERRORES ({len(error_df)} errores):")
        error_codes = error_df['responseCode'].value_counts()
        for code, count in error_codes.items():
            print(f"   - HTTP {code}: {count} ocurrencias")

    # Recomendaciones específicas
    print(f"\n💡 RECOMENDACIONES ESPECÍFICAS:")

    if p95_response_time > 200:
        print("   1. ⚡ Optimizar query de base de datos")
        print("   2. 🔍 Revisar índices en tabla submissions")
        print("   3. 💾 Considerar caching para submissions frecuentes")

    if success_rate < 99:
        print("   1. 🐛 Revisar logs para errores 404/500")
        print("   2. 🔒 Verificar validación de submissionId")
        print("   3. 📋 Checar permisos de acceso")

    if throughput < 500:
        print("   1. 🚀 Verificar Virtual Threads configuration")
        print("   2. 🗄️  Revisar pool de conexiones Hikari")
        print("   3. 🔄 Optimizar serialización JSON")

    print(f"\n" + "=" * 80)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python analyze-submission-results.py <resultados.csv>")
        sys.exit(1)

    analyze_submission_results(sys.argv[1])