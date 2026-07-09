import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import pandas as pd
from report_generator import generate_chart, filter_safe_borderline_results

data = []
for i in range(23):
    data.append({
        "Institute": f"IIT Test{i}",
        "Program": f"Program {i} Branch",
        "Chance": "Higher Chance (100.0% safe)" if i % 2 == 0 else f"{50+i}.0% Chance"
    })
df = pd.DataFrame(data)

df_chart = filter_safe_borderline_results(df)
print("Filtered rows:", len(df_chart))

buffer = generate_chart(df_chart)
print("Buffer is None?", buffer is None)

if buffer is not None:
    with open("debug_chart_output.png", "wb") as f:
        f.write(buffer.getvalue())
    print("Saved debug_chart_output.png — open this file directly and check.")