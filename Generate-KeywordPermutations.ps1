# ========================================================================
# Keyword Permutation Generator for Stanford CS LinkedIn Searches
# ========================================================================
# This script generates all permutations of keywords for comprehensive
# LinkedIn profile searches through SearxNG.
#
# Usage:
#   .\Generate-KeywordPermutations.ps1
#   .\Generate-KeywordPermutations.ps1 -ExportToFile "my_keywords.txt"
#   .\Generate-KeywordPermutations.ps1 -UseInSearch

[CmdletBinding()]
param(
    [string]$ExportToFile,
    [switch]$UseInSearch,
    [switch]$ShowCount
)

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Stanford CS Keyword Permutation Generator               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============== BASE COMPONENTS ==============

$InstitutionNames = @(
    "Stanford",
    "Stanford University"
)

$DepartmentNames = @(
    "Computer Science",
    "CS",
    "Comp Sci",
    "CompSci"
)

$DegreeTypes = @(
    "PhD",
    "Ph.D.",
    "Ph.D",
    "MS",
    "M.S.",
    "M.S",
    "MSc",
    "M.Sc.",
    "BS",
    "B.S.",
    "B.S",
    "BSc",
    "B.Sc.",
    "Masters",
    "Master's",
    "Bachelors",
    "Bachelor's",
    "Doctoral",
    "Doctorate"
)

$ResearchAreas = @(
    "Artificial Intelligence",
    "AI",
    "A.I.",
    "Machine Learning",
    "ML",
    "Deep Learning",
    "DL",
    "Natural Language Processing",
    "NLP",
    "Computer Vision",
    "CV",
    "Robotics",
    "Human-Computer Interaction",
    "HCI",
    "Data Science",
    "Reinforcement Learning",
    "RL",
    "Generative AI",
    "GenAI",
    "Large Language Models",
    "LLM",
    "Neural Networks",
    "NN",
    "Computer Graphics",
    "Systems",
    "Security",
    "Cryptography",
    "Theory",
    "Algorithms",
    "Bioinformatics",
    "Computational Biology"
)

$Positions = @(
    "Professor",
    "Prof",
    "Prof.",
    "Associate Professor",
    "Assistant Professor",
    "Faculty",
    "Researcher",
    "Research Scientist",
    "Research Associate",
    "Postdoc",
    "Postdoctoral",
    "Post-doc",
    "Student",
    "Graduate Student",
    "Grad Student",
    "PhD Student",
    "Doctoral Student",
    "PhD Candidate",
    "Doctoral Candidate",
    "Visiting Scholar",
    "Visiting Researcher",
    "Alumni",
    "Alum"
)

$Labs = @(
    "AI Lab",
    "SAIL",
    "NLP Group",
    "Vision Lab",
    "Graphics Lab",
    "HCI Group",
    "Systems Group",
    "Theory Group",
    "Security Lab",
    "HAI",
    "Human-Centered AI"
)

# ============== GENERATE PERMUTATIONS ==============

$AllKeywords = @()
$stats = @{
    TotalGenerated = 0
    Categories = @{}
}

Write-Host "[1/6] Generating Institution + Department combinations..." -ForegroundColor Yellow
foreach ($inst in $InstitutionNames) {
    foreach ($dept in $DepartmentNames) {
        $AllKeywords += "$inst $dept"
        $stats.TotalGenerated++
    }
}
$stats.Categories["Institution + Department"] = $AllKeywords.Count

Write-Host "[2/6] Generating Degree + Department combinations..." -ForegroundColor Yellow
$degreeStart = $AllKeywords.Count
foreach ($inst in $InstitutionNames) {
    foreach ($degree in $DegreeTypes) {
        foreach ($dept in $DepartmentNames) {
            $AllKeywords += "$inst $degree $dept"
            $stats.TotalGenerated++
        }
    }
}
$stats.Categories["Degree + Department"] = $AllKeywords.Count - $degreeStart

Write-Host "[3/6] Generating Research Area combinations..." -ForegroundColor Yellow
$researchStart = $AllKeywords.Count
foreach ($inst in $InstitutionNames) {
    foreach ($area in $ResearchAreas) {
        # Basic: Institution + Research Area
        $AllKeywords += "$inst $area"
        $stats.TotalGenerated++
        
        # With CS: Institution + CS + Research Area (select subset to avoid explosion)
        if ($area -in @("AI", "ML", "NLP", "CV", "DL", "RL", "HCI")) {
            $AllKeywords += "$inst CS $area"
            $AllKeywords += "$inst Computer Science $area"
            $stats.TotalGenerated += 2
        }
    }
}
$stats.Categories["Research Areas"] = $AllKeywords.Count - $researchStart

Write-Host "[4/6] Generating Position combinations..." -ForegroundColor Yellow
$positionStart = $AllKeywords.Count
foreach ($inst in $InstitutionNames) {
    foreach ($position in $Positions) {
        # Institution + Position + Department (select subset)
        $AllKeywords += "$inst $position Computer Science"
        $AllKeywords += "$inst $position CS"
        $stats.TotalGenerated += 2
    }
}
$stats.Categories["Positions"] = $AllKeywords.Count - $positionStart

Write-Host "[5/6] Generating Lab/Group combinations..." -ForegroundColor Yellow
$labStart = $AllKeywords.Count
foreach ($inst in $InstitutionNames) {
    foreach ($lab in $Labs) {
        $AllKeywords += "$inst $lab"
        $stats.TotalGenerated++
    }
}
$stats.Categories["Labs/Groups"] = $AllKeywords.Count - $labStart

Write-Host "[6/6] Generating high-value combined terms..." -ForegroundColor Yellow
$combinedStart = $AllKeywords.Count

# Degree + Research Area combinations (most valuable)
$topAreas = @("AI", "ML", "NLP", "CV", "Robotics", "HCI", "Data Science")
$topDegrees = @("PhD", "Ph.D.", "MS", "M.S.")

foreach ($inst in $InstitutionNames) {
    foreach ($degree in $topDegrees) {
        foreach ($area in $topAreas) {
            $AllKeywords += "$inst $degree $area"
            $stats.TotalGenerated++
        }
    }
}

# Position + Research Area combinations
$topPositions = @("Professor", "Researcher", "Research Scientist", "Postdoc")
foreach ($inst in $InstitutionNames) {
    foreach ($position in $topPositions) {
        foreach ($area in $topAreas) {
            $AllKeywords += "$inst $position $area"
            $stats.TotalGenerated++
        }
    }
}

# Multi-area combinations (AI + ML, etc.)
$multiArea = @(
    "AI ML",
    "AI NLP",
    "ML NLP",
    "AI Robotics",
    "ML CV",
    "DL CV",
    "NLP AI"
)
foreach ($inst in $InstitutionNames) {
    foreach ($combo in $multiArea) {
        $AllKeywords += "$inst $combo"
        $AllKeywords += "$inst PhD $combo"
        $stats.TotalGenerated += 2
    }
}

$stats.Categories["Combined Terms"] = $AllKeywords.Count - $combinedStart

# Remove duplicates (case-insensitive)
$uniqueKeywords = $AllKeywords | Sort-Object -Unique
$duplicatesRemoved = $AllKeywords.Count - $uniqueKeywords.Count

# ============== DISPLAY RESULTS ==============

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Permutation Generation Complete!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Statistics:" -ForegroundColor Cyan
Write-Host "   Total Generated:      $($stats.TotalGenerated)" -ForegroundColor White
Write-Host "   Duplicates Removed:   $duplicatesRemoved" -ForegroundColor Yellow
Write-Host "   Unique Keywords:      $($uniqueKeywords.Count)" -ForegroundColor Green

Write-Host "`n📋 Keywords by Category:" -ForegroundColor Cyan
foreach ($category in $stats.Categories.GetEnumerator() | Sort-Object Value -Descending) {
    Write-Host "   $($category.Key.PadRight(30)): $($category.Value)" -ForegroundColor White
}

if ($ShowCount) {
    Write-Host "`n✓ Count displayed. Use -ExportToFile or -UseInSearch for more options.`n" -ForegroundColor Green
    exit
}

# ============== EXPORT OPTIONS ==============

if ($ExportToFile) {
    Write-Host "`n[EXPORT] Writing to file: $ExportToFile" -ForegroundColor Cyan
    
    $header = @"
# ========================================================================
# Generated Stanford CS LinkedIn Keywords
# ========================================================================
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Total Keywords: $($uniqueKeywords.Count)
#
# Usage with ScriptQueries.ps1:
#   `$keywords = Get-Content "$ExportToFile" | Where-Object {`$_ -notmatch '^#|^$'}
#   .\ScriptQueries.ps1 -Keywords `$keywords
# ========================================================================

"@
    
    $header | Out-File -FilePath $ExportToFile -Encoding UTF8
    $uniqueKeywords | Out-File -FilePath $ExportToFile -Append -Encoding UTF8
    
    Write-Host "   ✓ Exported $($uniqueKeywords.Count) keywords to: $ExportToFile" -ForegroundColor Green
    Write-Host "`n💡 Load these keywords:" -ForegroundColor Cyan
    Write-Host "   `$keywords = Get-Content `"$ExportToFile`" | Where-Object {`$_ -notmatch '^#|^`$'}" -ForegroundColor White
    Write-Host "   .\ScriptQueries.ps1 -Keywords `$keywords`n" -ForegroundColor White
}

if ($UseInSearch) {
    Write-Host "`n[SEARCH] Preparing to run ScriptQueries.ps1 with generated keywords..." -ForegroundColor Cyan
    Write-Host "   Keywords: $($uniqueKeywords.Count)" -ForegroundColor White
    Write-Host "   Estimated time: $(([math]::Ceiling($uniqueKeywords.Count * 5 / 60))) minutes (with pagination)`n" -ForegroundColor Yellow
    
    $confirm = Read-Host "Run search with all $($uniqueKeywords.Count) keywords? (y/n)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Host "`n🚀 Starting comprehensive search...`n" -ForegroundColor Green
        & ".\ScriptQueries.ps1" -Keywords $uniqueKeywords -UseCache -Verbose -ExportFormat ALL
    }
    else {
        Write-Host "   ✗ Search cancelled." -ForegroundColor Yellow
        Write-Host "`n💡 Export keywords first, then review before running:" -ForegroundColor Cyan
        Write-Host "   .\Generate-KeywordPermutations.ps1 -ExportToFile `"generated_keywords.txt`"`n" -ForegroundColor White
    }
}

# ============== SAMPLE OUTPUT ==============

if (-not $ExportToFile -and -not $UseInSearch) {
    Write-Host "`n📝 Sample Keywords (first 20):" -ForegroundColor Cyan
    $uniqueKeywords | Select-Object -First 20 | ForEach-Object {
        Write-Host "   • $_" -ForegroundColor White
    }
    Write-Host "   ... and $($uniqueKeywords.Count - 20) more`n" -ForegroundColor Gray
    
    Write-Host "⚡ Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Export to file:  " -NoNewline -ForegroundColor Gray
    Write-Host ".\Generate-KeywordPermutations.ps1 -ExportToFile `"keywords.txt`"" -ForegroundColor White
    Write-Host "   2. Run search:      " -NoNewline -ForegroundColor Gray
    Write-Host ".\Generate-KeywordPermutations.ps1 -UseInSearch" -ForegroundColor White
    Write-Host "   3. Just count:      " -NoNewline -ForegroundColor Gray
    Write-Host ".\Generate-KeywordPermutations.ps1 -ShowCount`n" -ForegroundColor White
}

Write-Host ""

