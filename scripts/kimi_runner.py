#!/usr/bin/env python3
"""
Kimi Agent Runner - 封装 Kimi CLI 作为可重用的任务执行器
用于 IDLE 游戏项目的自动化开发

用法:
    python3 kimi_runner.py <task.json>
    
task.json 格式:
    {
        "task": "任务描述",
        "context": "项目上下文信息",
        "file_operations": [
            {"action": "read", "path": "js/config/cards.js"},
            {"action": "write", "path": "js/config/cards.js", "content": "..."}
        ],
        "validation": "验证条件"
    }
"""

import subprocess
import json
import os
import sys
import time
from pathlib import Path

# 配置
KIMI_EXE = "/mnt/c/Users/10575/.local/bin/kimi.exe"
WORK_DIR = "D:\\Work\\IDLE"
PROJECT_ROOT = "/mnt/d/Work/IDLE"


def run_kimi_task(task_def: dict) -> dict:
    """
    执行 Kimi 任务
    
    Args:
        task_def: 任务定义字典
        
    Returns:
        {"success": bool, "message": str, "output": str}
    """
    
    # 写入任务定义文件
    task_file = os.path.join(PROJECT_ROOT, ".kimi_task.json")
    with open(task_file, "w", encoding="utf-8") as f:
        json.dump(task_def, f, ensure_ascii=False, indent=2)
    
    # 构建 prompt
    prompt = f"""You are an expert game development assistant working on an IDLE web game project.

Task Definition (read from D:\\Work\\IDLE\\.kimi_task.json):
{json.dumps(task_def, ensure_ascii=False, indent=2)}

Instructions:
1. Read the task definition from D:\\Work\\IDLE\\.kimi_task.json
2. Understand the project structure by reading relevant files
3. Execute the task precisely
4. Save all file changes
5. Write result to D:\\Work\\IDLE\\.kimi_result.json with this exact format:
   {{"success": true/false, "message": "description of what was done", "files_modified": ["list", "of", "files"]}}

Rules:
- ONLY use English in console output (no Chinese characters)
- Do NOT output file contents to console
- Follow existing code style and conventions
- Ensure all JavaScript syntax is valid
- Run tests if available (cd D:\\Work\\IDLE\\tests && node run-node.js)
- If tests fail, fix the issues and re-run
"""
    
    prompt_file = os.path.join(PROJECT_ROOT, ".kimi_prompt.txt")
    with open(prompt_file, "w", encoding="utf-8") as f:
        f.write(prompt)
    
    # 启动 Kimi CLI
    proc = subprocess.Popen(
        [KIMI_EXE, "--print", "--output-format", "text", "--no-thinking", "-w", WORK_DIR],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=False,
        bufsize=0
    )
    
    # 发送 prompt
    with open(prompt_file, "rb") as f:
        prompt_bytes = f.read()
    
    try:
        stdout_b, stderr_b = proc.communicate(input=prompt_bytes + b"\n", timeout=300)
    except subprocess.TimeoutExpired:
        proc.kill()
        return {"success": False, "message": "Kimi task timed out after 300s", "output": ""}
    
    stdout = stdout_b.decode("utf-8", errors="replace")
    stderr = stderr_b.decode("utf-8", errors="replace")
    
    # 读取结果
    result_file = os.path.join(PROJECT_ROOT, ".kimi_result.json")
    result = {"success": False, "message": "No result file", "output": stdout[:2000]}
    
    if os.path.exists(result_file):
        try:
            with open(result_file, "r", encoding="utf-8") as f:
                result = json.load(f)
            result["output"] = stdout[:2000]
            os.remove(result_file)
        except Exception as e:
            result = {"success": False, "message": f"Failed to parse result: {e}", "output": stdout[:2000]}
    
    # 清理
    for f in [task_file, prompt_file]:
        if os.path.exists(f):
            os.remove(f)
    
    result["exit_code"] = proc.returncode
    result["stderr"] = stderr[:500]
    
    return result


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 kimi_runner.py <task.json>")
        print("\nExample task.json:")
        print(json.dumps({
            "task": "Add a new SR card",
            "card": {
                "id": "sr_010",
                "name": "New Card",
                "rarity": "SR",
                "basePower": 25,
                "effect": "power",
                "desc": "A powerful new card"
            }
        }, indent=2))
        sys.exit(1)
    
    task_file = sys.argv[1]
    with open(task_file, "r", encoding="utf-8") as f:
        task_def = json.load(f)
    
    print(f"Running Kimi task: {task_def.get('task', 'Unknown')}")
    result = run_kimi_task(task_def)
    
    print("\n" + "=" * 60)
    print("RESULT:")
    print("=" * 60)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
