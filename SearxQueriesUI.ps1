# ===============================================================
# SearxNG LinkedIn Collector - GUI Edition
# ===============================================================
# A graphical interface for managing keywords and running searches
# 
# Usage:
#   .\SearxQueriesUI.ps1

[CmdletBinding()]
param()

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms

# ============== XAML UI DEFINITION ==============
$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="SearxNG LinkedIn Collector - UI" Height="750" Width="1100" 
        WindowStartupLocation="CenterScreen" Background="#F5F5F5">
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Padding" Value="10,5"/>
            <Setter Property="Margin" Value="5"/>
            <Setter Property="FontSize" Value="12"/>
            <Setter Property="Cursor" Value="Hand"/>
            <Setter Property="Background" Value="#0077B5"/>
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="BorderThickness" Value="0"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
            <Style.Triggers>
                <Trigger Property="IsMouseOver" Value="True">
                    <Setter Property="Background" Value="#005A8C"/>
                </Trigger>
            </Style.Triggers>
        </Style>
        <Style TargetType="TextBox">
            <Setter Property="Padding" Value="5"/>
            <Setter Property="Margin" Value="5"/>
            <Setter Property="FontSize" Value="12"/>
            <Setter Property="BorderBrush" Value="#CCCCCC"/>
        </Style>
        <Style TargetType="Label">
            <Setter Property="FontSize" Value="12"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
            <Setter Property="Margin" Value="5,5,5,0"/>
        </Style>
    </Window.Resources>
    
    <Grid Margin="10">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="200"/>
        </Grid.RowDefinitions>
        
        <!-- Header -->
        <Border Grid.Row="0" Background="#0077B5" CornerRadius="5" Padding="15" Margin="0,0,0,10">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                <StackPanel Grid.Column="0">
                    <TextBlock Text="🔍 SearxNG LinkedIn Collector" FontSize="24" FontWeight="Bold" Foreground="White"/>
                    <TextBlock Name="SubtitleText" Text="Professional Edition v2.1 - Graphical Interface" FontSize="12" Foreground="#E0E0E0" Margin="0,5,0,0"/>
                </StackPanel>
                <StackPanel Grid.Column="1" VerticalAlignment="Center">
                    <TextBlock Name="KeywordCountText" Text="Keywords: 0" FontSize="14" FontWeight="Bold" Foreground="White" HorizontalAlignment="Right"/>
                    <TextBlock Name="SelectedCountText" Text="Selected: 0" FontSize="12" Foreground="#E0E0E0" HorizontalAlignment="Right" Margin="0,3,0,0"/>
                </StackPanel>
            </Grid>
        </Border>
        
        <!-- Main Content -->
        <Grid Grid.Row="1">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="2*"/>
                <ColumnDefinition Width="5"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            
            <!-- Keywords List Panel -->
            <Border Grid.Column="0" Background="White" BorderBrush="#DDDDDD" BorderThickness="1" CornerRadius="5" Padding="10">
                <Grid>
                    <Grid.RowDefinitions>
                        <RowDefinition Height="Auto"/>
                        <RowDefinition Height="Auto"/>
                        <RowDefinition Height="*"/>
                        <RowDefinition Height="Auto"/>
                    </Grid.RowDefinitions>
                    
                    <Label Grid.Row="0" Content="📋 Keyword List" FontSize="16"/>
                    
                    <!-- Search/Filter Box -->
                    <TextBox Grid.Row="1" Name="FilterBox" Text="" Margin="5" Padding="8">
                        <TextBox.Style>
                            <Style TargetType="TextBox">
                                <Setter Property="Foreground" Value="Black"/>
                                <Style.Triggers>
                                    <Trigger Property="Text" Value="">
                                        <Setter Property="Background">
                                            <Setter.Value>
                                                <VisualBrush Stretch="None" AlignmentX="Left">
                                                    <VisualBrush.Visual>
                                                        <TextBlock Text="🔍 Search keywords..." Foreground="#999999" Margin="5,0,0,0"/>
                                                    </VisualBrush.Visual>
                                                </VisualBrush>
                                            </Setter.Value>
                                        </Setter>
                                    </Trigger>
                                </Style.Triggers>
                            </Style>
                        </TextBox.Style>
                    </TextBox>
                    
                    <!-- Keywords ListBox -->
                    <ListBox Grid.Row="2" Name="KeywordsList" SelectionMode="Extended" 
                             ScrollViewer.VerticalScrollBarVisibility="Auto" Margin="5"
                             FontFamily="Segoe UI" FontSize="12">
                        <ListBox.ItemContainerStyle>
                            <Style TargetType="ListBoxItem">
                                <Setter Property="Padding" Value="5"/>
                                <Style.Triggers>
                                    <Trigger Property="IsSelected" Value="True">
                                        <Setter Property="Background" Value="#E7F3FF"/>
                                        <Setter Property="Foreground" Value="#0077B5"/>
                                    </Trigger>
                                </Style.Triggers>
                            </Style>
                        </ListBox.ItemContainerStyle>
                    </ListBox>
                    
                    <!-- Keyword Management Buttons -->
                    <WrapPanel Grid.Row="3" Orientation="Horizontal" Margin="5">
                        <Button Name="AddKeywordBtn" Content="➕ Add" Width="80"/>
                        <Button Name="EditKeywordBtn" Content="✏️ Edit" Width="80"/>
                        <Button Name="DeleteKeywordBtn" Content="🗑️ Delete" Width="80"/>
                        <Button Name="ClearAllBtn" Content="Clear All" Width="80" Background="#DC3545"/>
                        <Button Name="SelectAllBtn" Content="Select All" Width="80" Background="#6C757D"/>
                        <Button Name="DeselectAllBtn" Content="Deselect" Width="80" Background="#6C757D"/>
                    </WrapPanel>
                </Grid>
            </Border>
            
            <GridSplitter Grid.Column="1" Width="5" HorizontalAlignment="Stretch" Background="#DDDDDD"/>
            
            <!-- Configuration Panel -->
            <Border Grid.Column="2" Background="White" BorderBrush="#DDDDDD" BorderThickness="1" CornerRadius="5" Padding="10">
                <ScrollViewer VerticalScrollBarVisibility="Auto">
                    <StackPanel>
                        <Label Content="⚙️ Configuration" FontSize="16"/>
                        
                        <!-- File Operations -->
                        <GroupBox Header="📁 File Operations" Margin="5" Padding="5">
                            <StackPanel>
                                <Button Name="LoadFromFileBtn" Content="📂 Load from File" HorizontalAlignment="Stretch" Background="#28A745"/>
                                <Button Name="SaveToFileBtn" Content="💾 Save to File" HorizontalAlignment="Stretch" Background="#17A2B8"/>
                                <Button Name="GeneratePermutationsBtn" Content="🔄 Generate Permutations" HorizontalAlignment="Stretch" Background="#FFC107" Foreground="Black"/>
                            </StackPanel>
                        </GroupBox>
                        
                        <!-- SearxNG Settings -->
                        <GroupBox Header="🔧 SearxNG Settings" Margin="5" Padding="5">
                            <StackPanel>
                                <Label Content="SearxNG URL:" FontSize="11"/>
                                <TextBox Name="SearxUrlBox" Text="http://localhost:8888"/>
                                
                                <Label Content="Work Directory:" FontSize="11"/>
                                <TextBox Name="WorkDirBox" Text="C:\SearxQueries"/>
                            </StackPanel>
                        </GroupBox>
                        
                        <!-- Search Options -->
                        <GroupBox Header="🎯 Search Options" Margin="5" Padding="5">
                            <StackPanel>
                                <CheckBox Name="UseCacheCheck" Content="Use Cache" IsChecked="True" Margin="5"/>
                                <CheckBox Name="OpenResultsCheck" Content="Auto-open Results" IsChecked="True" Margin="5"/>
                                <CheckBox Name="VerboseCheck" Content="Verbose Output" IsChecked="False" Margin="5"/>
                                
                                <Label Content="Export Format:" FontSize="11"/>
                                <ComboBox Name="ExportFormatCombo" SelectedIndex="0" Margin="5">
                                    <ComboBoxItem Content="ALL"/>
                                    <ComboBoxItem Content="CSV"/>
                                    <ComboBoxItem Content="JSON"/>
                                    <ComboBoxItem Content="TXT"/>
                                    <ComboBoxItem Content="HTML"/>
                                </ComboBox>
                                
                                <Label Content="Delay (seconds):" FontSize="11"/>
                                <TextBox Name="DelayBox" Text="2"/>
                                
                                <Label Content="Max Retries:" FontSize="11"/>
                                <TextBox Name="MaxRetriesBox" Text="3"/>
                            </StackPanel>
                        </GroupBox>
                        
                        <!-- Quick Actions -->
                        <GroupBox Header="⚡ Quick Actions" Margin="5" Padding="5">
                            <StackPanel>
                                <Button Name="OpenResultsFolderBtn" Content="📂 Results Folder" HorizontalAlignment="Stretch" Background="#6C757D"/>
                                <Button Name="OpenReportsFolderBtn" Content="📊 Reports Folder" HorizontalAlignment="Stretch" Background="#6C757D"/>
                                <Button Name="OpenLogsFolderBtn" Content="📝 Logs Folder" HorizontalAlignment="Stretch" Background="#6C757D"/>
                            </StackPanel>
                        </GroupBox>
                    </StackPanel>
                </ScrollViewer>
            </Border>
        </Grid>
        
        <!-- Action Buttons -->
        <Border Grid.Row="2" Background="White" BorderBrush="#DDDDDD" BorderThickness="1" CornerRadius="5" Padding="10" Margin="0,10">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                
                <StackPanel Grid.Column="0" Orientation="Horizontal" VerticalAlignment="Center">
                    <TextBlock Name="StatusText" Text="Ready" FontSize="12" VerticalAlignment="Center" Margin="10,0"/>
                </StackPanel>
                
                <StackPanel Grid.Column="1" Orientation="Horizontal">
                    <Button Name="TestConnectionBtn" Content="🔌 Test Connection" Width="140" Background="#17A2B8"/>
                    <Button Name="RunSearchBtn" Content="▶️ Run Search" Width="140" FontSize="14" Background="#28A745"/>
                    <Button Name="StopSearchBtn" Content="⏹️ Stop" Width="80" Background="#DC3545" IsEnabled="False"/>
                </StackPanel>
            </Grid>
        </Border>
        
        <!-- Output Console -->
        <Border Grid.Row="3" Background="White" BorderBrush="#DDDDDD" BorderThickness="1" CornerRadius="5" Padding="10" Margin="0,10,0,0">
            <Grid>
                <Grid.RowDefinitions>
                    <RowDefinition Height="Auto"/>
                    <RowDefinition Height="*"/>
                </Grid.RowDefinitions>
                
                <StackPanel Grid.Row="0" Orientation="Horizontal">
                    <Label Content="📺 Output Console" FontSize="14"/>
                    <Button Name="ClearConsoleBtn" Content="Clear" Width="60" Height="25" Background="#6C757D" Margin="10,0,0,0"/>
                </StackPanel>
                
                <TextBox Grid.Row="1" Name="ConsoleOutput" 
                         IsReadOnly="True" 
                         VerticalScrollBarVisibility="Auto" 
                         TextWrapping="Wrap" 
                         FontFamily="Consolas" 
                         FontSize="11"
                         Background="#F8F9FA"
                         Foreground="#212529"
                         Margin="5"/>
            </Grid>
        </Border>
    </Grid>
</Window>
"@

# ============== LOAD XAML ==============
$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [Windows.Markup.XamlReader]::Load($reader)

# ============== GET UI ELEMENTS ==============
$keywordsList = $window.FindName("KeywordsList")
$filterBox = $window.FindName("FilterBox")
$addKeywordBtn = $window.FindName("AddKeywordBtn")
$editKeywordBtn = $window.FindName("EditKeywordBtn")
$deleteKeywordBtn = $window.FindName("DeleteKeywordBtn")
$clearAllBtn = $window.FindName("ClearAllBtn")
$selectAllBtn = $window.FindName("SelectAllBtn")
$deselectAllBtn = $window.FindName("DeselectAllBtn")

$loadFromFileBtn = $window.FindName("LoadFromFileBtn")
$saveToFileBtn = $window.FindName("SaveToFileBtn")
$generatePermutationsBtn = $window.FindName("GeneratePermutationsBtn")

$searxUrlBox = $window.FindName("SearxUrlBox")
$workDirBox = $window.FindName("WorkDirBox")
$useCacheCheck = $window.FindName("UseCacheCheck")
$openResultsCheck = $window.FindName("OpenResultsCheck")
$verboseCheck = $window.FindName("VerboseCheck")
$exportFormatCombo = $window.FindName("ExportFormatCombo")
$delayBox = $window.FindName("DelayBox")
$maxRetriesBox = $window.FindName("MaxRetriesBox")

$openResultsFolderBtn = $window.FindName("OpenResultsFolderBtn")
$openReportsFolderBtn = $window.FindName("OpenReportsFolderBtn")
$openLogsFolderBtn = $window.FindName("OpenLogsFolderBtn")

$testConnectionBtn = $window.FindName("TestConnectionBtn")
$runSearchBtn = $window.FindName("RunSearchBtn")
$stopSearchBtn = $window.FindName("StopSearchBtn")

$consoleOutput = $window.FindName("ConsoleOutput")
$statusText = $window.FindName("StatusText")
$keywordCountText = $window.FindName("KeywordCountText")
$selectedCountText = $window.FindName("SelectedCountText")
$clearConsoleBtn = $window.FindName("ClearConsoleBtn")

# ============== GLOBAL STATE ==============
$script:keywords = New-Object System.Collections.ObjectModel.ObservableCollection[string]
$script:allKeywords = @()
$script:isSearchRunning = $false
$script:searchJob = $null
$script:timer = $null

# ============== HELPER FUNCTIONS ==============

function Write-Console {
    param([string]$Message, [string]$Color = "Black")
    
    $window.Dispatcher.Invoke([action]{
        $timestamp = Get-Date -Format "HH:mm:ss"
        $consoleOutput.AppendText("[$timestamp] $Message`r`n")
        $consoleOutput.ScrollToEnd()
    })
}

function Update-KeywordCount {
    $window.Dispatcher.Invoke([action]{
        $keywordCountText.Text = "Keywords: $($script:keywords.Count)"
        $selectedCountText.Text = "Selected: $($keywordsList.SelectedItems.Count)"
    })
}

function Update-Status {
    param([string]$Message)
    $window.Dispatcher.Invoke([action]{
        $statusText.Text = $Message
    })
}

function Refresh-KeywordsList {
    param([string]$filter = "")
    
    $script:keywords.Clear()
    
    if ([string]::IsNullOrWhiteSpace($filter)) {
        foreach ($kw in $script:allKeywords) {
            $script:keywords.Add($kw)
        }
    }
    else {
        foreach ($kw in $script:allKeywords) {
            if ($kw -like "*$filter*") {
                $script:keywords.Add($kw)
            }
        }
    }
    
    Update-KeywordCount
}

function Load-DefaultKeywords {
    $defaultKeywords = @(
        "Stanford Computer Science",
        "Stanford AI",
        "Stanford Machine Learning",
        "Stanford PhD Computer Science",
        "Stanford Artificial Intelligence",
        "Stanford ML",
        "Stanford Deep Learning",
        "Stanford NLP"
    )
    
    $script:allKeywords = $defaultKeywords
    Refresh-KeywordsList
    Write-Console "Loaded $($defaultKeywords.Count) default keywords"
    Update-Status "Loaded default keywords"
}

# ============== EVENT HANDLERS ==============

# Filter box text changed
$filterBox.Add_TextChanged({
    Refresh-KeywordsList -filter $filterBox.Text
})

# Keywords list selection changed
$keywordsList.Add_SelectionChanged({
    Update-KeywordCount
})

# Add keyword button
$addKeywordBtn.Add_Click({
    $inputBox = New-Object System.Windows.Window
    $inputBox.Title = "Add Keyword"
    $inputBox.Width = 400
    $inputBox.Height = 150
    $inputBox.WindowStartupLocation = "CenterOwner"
    $inputBox.Owner = $window
    
    $grid = New-Object System.Windows.Controls.Grid
    $grid.Margin = "10"
    
    $label = New-Object System.Windows.Controls.Label
    $label.Content = "Enter keyword:"
    $label.Margin = "0,0,0,5"
    
    $textBox = New-Object System.Windows.Controls.TextBox
    $textBox.Margin = "0,30,0,0"
    $textBox.Height = 30
    $textBox.FontSize = 12
    
    $buttonPanel = New-Object System.Windows.Controls.StackPanel
    $buttonPanel.Orientation = "Horizontal"
    $buttonPanel.HorizontalAlignment = "Right"
    $buttonPanel.Margin = "0,70,0,0"
    
    $okBtn = New-Object System.Windows.Controls.Button
    $okBtn.Content = "Add"
    $okBtn.Width = 80
    $okBtn.Margin = "5"
    $okBtn.IsDefault = $true
    $okBtn.Add_Click({
        if (-not [string]::IsNullOrWhiteSpace($textBox.Text)) {
            $newKeyword = $textBox.Text.Trim()
            if ($script:allKeywords -notcontains $newKeyword) {
                $script:allKeywords += $newKeyword
                Refresh-KeywordsList -filter $filterBox.Text
                Write-Console "Added keyword: $newKeyword"
                Update-Status "Added keyword"
            }
            else {
                [System.Windows.MessageBox]::Show("Keyword already exists!", "Duplicate", "OK", "Warning")
            }
        }
        $inputBox.Close()
    })
    
    $cancelBtn = New-Object System.Windows.Controls.Button
    $cancelBtn.Content = "Cancel"
    $cancelBtn.Width = 80
    $cancelBtn.Margin = "5"
    $cancelBtn.IsCancel = $true
    $cancelBtn.Add_Click({ $inputBox.Close() })
    
    $buttonPanel.AddChild($okBtn)
    $buttonPanel.AddChild($cancelBtn)
    
    $grid.AddChild($label)
    $grid.AddChild($textBox)
    $grid.AddChild($buttonPanel)
    
    $inputBox.Content = $grid
    $textBox.Focus()
    $inputBox.ShowDialog()
})

# Edit keyword button
$editKeywordBtn.Add_Click({
    if ($keywordsList.SelectedItems.Count -eq 1) {
        $selected = $keywordsList.SelectedItem
        $index = $script:allKeywords.IndexOf($selected)
        
        $inputBox = New-Object System.Windows.Window
        $inputBox.Title = "Edit Keyword"
        $inputBox.Width = 400
        $inputBox.Height = 150
        $inputBox.WindowStartupLocation = "CenterOwner"
        $inputBox.Owner = $window
        
        $grid = New-Object System.Windows.Controls.Grid
        $grid.Margin = "10"
        
        $label = New-Object System.Windows.Controls.Label
        $label.Content = "Edit keyword:"
        $label.Margin = "0,0,0,5"
        
        $textBox = New-Object System.Windows.Controls.TextBox
        $textBox.Text = $selected
        $textBox.Margin = "0,30,0,0"
        $textBox.Height = 30
        $textBox.FontSize = 12
        
        $buttonPanel = New-Object System.Windows.Controls.StackPanel
        $buttonPanel.Orientation = "Horizontal"
        $buttonPanel.HorizontalAlignment = "Right"
        $buttonPanel.Margin = "0,70,0,0"
        
        $okBtn = New-Object System.Windows.Controls.Button
        $okBtn.Content = "Save"
        $okBtn.Width = 80
        $okBtn.Margin = "5"
        $okBtn.IsDefault = $true
        $okBtn.Add_Click({
            if (-not [string]::IsNullOrWhiteSpace($textBox.Text)) {
                $newValue = $textBox.Text.Trim()
                $script:allKeywords[$index] = $newValue
                Refresh-KeywordsList -filter $filterBox.Text
                Write-Console "Edited keyword: $selected -> $newValue"
                Update-Status "Keyword updated"
            }
            $inputBox.Close()
        })
        
        $cancelBtn = New-Object System.Windows.Controls.Button
        $cancelBtn.Content = "Cancel"
        $cancelBtn.Width = 80
        $cancelBtn.Margin = "5"
        $cancelBtn.IsCancel = $true
        $cancelBtn.Add_Click({ $inputBox.Close() })
        
        $buttonPanel.AddChild($okBtn)
        $buttonPanel.AddChild($cancelBtn)
        
        $grid.AddChild($label)
        $grid.AddChild($textBox)
        $grid.AddChild($buttonPanel)
        
        $inputBox.Content = $grid
        $textBox.SelectAll()
        $textBox.Focus()
        $inputBox.ShowDialog()
    }
    else {
        [System.Windows.MessageBox]::Show("Please select exactly one keyword to edit.", "Edit Keyword", "OK", "Information")
    }
})

# Delete keyword button
$deleteKeywordBtn.Add_Click({
    if ($keywordsList.SelectedItems.Count -gt 0) {
        $result = [System.Windows.MessageBox]::Show(
            "Delete $($keywordsList.SelectedItems.Count) selected keyword(s)?",
            "Confirm Delete",
            "YesNo",
            "Question"
        )
        
        if ($result -eq "Yes") {
            $toDelete = @($keywordsList.SelectedItems)
            foreach ($kw in $toDelete) {
                $script:allKeywords = $script:allKeywords | Where-Object { $_ -ne $kw }
            }
            Refresh-KeywordsList -filter $filterBox.Text
            Write-Console "Deleted $($toDelete.Count) keyword(s)"
            Update-Status "Keywords deleted"
        }
    }
    else {
        [System.Windows.MessageBox]::Show("Please select keyword(s) to delete.", "Delete Keywords", "OK", "Information")
    }
})

# Clear all button
$clearAllBtn.Add_Click({
    $result = [System.Windows.MessageBox]::Show(
        "Clear all keywords? This cannot be undone.",
        "Confirm Clear",
        "YesNo",
        "Warning"
    )
    
    if ($result -eq "Yes") {
        $script:allKeywords = @()
        Refresh-KeywordsList
        Write-Console "Cleared all keywords"
        Update-Status "All keywords cleared"
    }
})

# Select all button
$selectAllBtn.Add_Click({
    $keywordsList.SelectAll()
})

# Deselect all button
$deselectAllBtn.Add_Click({
    $keywordsList.UnselectAll()
})

# Load from file button
$loadFromFileBtn.Add_Click({
    $openFileDialog = New-Object System.Windows.Forms.OpenFileDialog
    $openFileDialog.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*"
    $openFileDialog.InitialDirectory = $PSScriptRoot
    
    if ($openFileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        try {
            $loadedKeywords = Get-Content $openFileDialog.FileName | 
                Where-Object { $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' } |
                ForEach-Object { $_.Trim() }
            
            $script:allKeywords = $loadedKeywords
            Refresh-KeywordsList
            Write-Console "Loaded $($loadedKeywords.Count) keywords from: $($openFileDialog.FileName)"
            Update-Status "Keywords loaded from file"
        }
        catch {
            [System.Windows.MessageBox]::Show("Error loading file: $($_.Exception.Message)", "Error", "OK", "Error")
            Write-Console "ERROR: Failed to load file - $($_.Exception.Message)"
        }
    }
})

# Save to file button
$saveToFileBtn.Add_Click({
    if ($script:allKeywords.Count -eq 0) {
        [System.Windows.MessageBox]::Show("No keywords to save.", "Save Keywords", "OK", "Information")
        return
    }
    
    $saveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
    $saveFileDialog.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*"
    $saveFileDialog.DefaultExt = "txt"
    $saveFileDialog.FileName = "keywords_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    $saveFileDialog.InitialDirectory = $PSScriptRoot
    
    if ($saveFileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        try {
            $header = @"
# Generated Keywords - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Total Keywords: $($script:allKeywords.Count)

"@
            $header | Out-File -FilePath $saveFileDialog.FileName -Encoding UTF8
            $script:allKeywords | Out-File -FilePath $saveFileDialog.FileName -Append -Encoding UTF8
            
            Write-Console "Saved $($script:allKeywords.Count) keywords to: $($saveFileDialog.FileName)"
            Update-Status "Keywords saved to file"
            [System.Windows.MessageBox]::Show("Keywords saved successfully!", "Save Complete", "OK", "Information")
        }
        catch {
            [System.Windows.MessageBox]::Show("Error saving file: $($_.Exception.Message)", "Error", "OK", "Error")
            Write-Console "ERROR: Failed to save file - $($_.Exception.Message)"
        }
    }
})

# Generate permutations button
$generatePermutationsBtn.Add_Click({
    if (Test-Path ".\Generate-KeywordPermutations.ps1") {
        Write-Console "Generating keyword permutations..."
        Update-Status "Generating permutations..."
        
        try {
            $tempFile = Join-Path $env:TEMP "temp_keywords_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
            & ".\Generate-KeywordPermutations.ps1" -ExportToFile $tempFile
            
            if (Test-Path $tempFile) {
                $loadedKeywords = Get-Content $tempFile | 
                    Where-Object { $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' } |
                    ForEach-Object { $_.Trim() }
                
                $script:allKeywords = $loadedKeywords
                Refresh-KeywordsList
                Write-Console "Generated and loaded $($loadedKeywords.Count) keyword permutations"
                Update-Status "Permutations generated"
                
                Remove-Item $tempFile -Force
            }
        }
        catch {
            [System.Windows.MessageBox]::Show("Error generating permutations: $($_.Exception.Message)", "Error", "OK", "Error")
            Write-Console "ERROR: Failed to generate permutations - $($_.Exception.Message)"
        }
    }
    else {
        [System.Windows.MessageBox]::Show("Generate-KeywordPermutations.ps1 not found in current directory.", "Error", "OK", "Error")
    }
})

# Open folders buttons
$openResultsFolderBtn.Add_Click({
    $resultsPath = Join-Path $workDirBox.Text "results"
    if (Test-Path $resultsPath) {
        Start-Process explorer $resultsPath
    }
    else {
        [System.Windows.MessageBox]::Show("Results folder does not exist yet.", "Folder Not Found", "OK", "Information")
    }
})

$openReportsFolderBtn.Add_Click({
    $reportsPath = Join-Path $workDirBox.Text "reports"
    if (Test-Path $reportsPath) {
        Start-Process explorer $reportsPath
    }
    else {
        [System.Windows.MessageBox]::Show("Reports folder does not exist yet.", "Folder Not Found", "OK", "Information")
    }
})

$openLogsFolderBtn.Add_Click({
    $logsPath = Join-Path $workDirBox.Text "logs"
    if (Test-Path $logsPath) {
        Start-Process explorer $logsPath
    }
    else {
        [System.Windows.MessageBox]::Show("Logs folder does not exist yet.", "Folder Not Found", "OK", "Information")
    }
})

# Test connection button
$testConnectionBtn.Add_Click({
    Write-Console "Testing connection to SearxNG..."
    Update-Status "Testing connection..."
    
    try {
        $testHeaders = @{
            'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            'Accept' = 'application/json'
        }
        $testQuery = [uri]::EscapeDataString("test")
        $searxUrl = $searxUrlBox.Text
        $null = Invoke-WebRequest -Uri "$searxUrl/search?q=$testQuery&format=json" -Headers $testHeaders -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        Write-Console "✓ Connection successful! SearxNG is accessible."
        Update-Status "Connection OK"
        [System.Windows.MessageBox]::Show("Successfully connected to SearxNG!", "Connection Test", "OK", "Information")
    }
    catch {
        Write-Console "✗ Connection failed: $($_.Exception.Message)"
        Update-Status "Connection failed"
        [System.Windows.MessageBox]::Show("Failed to connect to SearxNG:`n$($_.Exception.Message)", "Connection Error", "OK", "Error")
    }
})

# Run search button
$runSearchBtn.Add_Click({
    if ($script:allKeywords.Count -eq 0) {
        [System.Windows.MessageBox]::Show("No keywords loaded. Please add or load keywords first.", "No Keywords", "OK", "Warning")
        return
    }
    
    if ($script:isSearchRunning) {
        [System.Windows.MessageBox]::Show("A search is already running.", "Search Running", "OK", "Information")
        return
    }
    
    # Get selected keywords or use all
    $keywordsToSearch = if ($keywordsList.SelectedItems.Count -gt 0) {
        @($keywordsList.SelectedItems)
    } else {
        $script:allKeywords
    }
    
    $result = [System.Windows.MessageBox]::Show(
        "Run search with $($keywordsToSearch.Count) keyword(s)?`n`nThis may take several minutes depending on the number of keywords.",
        "Confirm Search",
        "YesNo",
        "Question"
    )
    
    if ($result -eq "Yes") {
        $script:isSearchRunning = $true
        $runSearchBtn.IsEnabled = $false
        $stopSearchBtn.IsEnabled = $true
        
        Write-Console "========================================="
        Write-Console "Starting search with $($keywordsToSearch.Count) keywords..."
        Write-Console "========================================="
        Update-Status "Search running..."
        
        # Build command arguments
        $scriptPath = Join-Path $PSScriptRoot "ScriptQueries.ps1"
        
        if (-not (Test-Path $scriptPath)) {
            [System.Windows.MessageBox]::Show("ScriptQueries.ps1 not found in current directory.", "Error", "OK", "Error")
            $script:isSearchRunning = $false
            $runSearchBtn.IsEnabled = $true
            $stopSearchBtn.IsEnabled = $false
            return
        }
        
        # Build hashtable for splatting
        $searchParams = @{
            SearxURL = $searxUrlBox.Text
            WorkDir = $workDirBox.Text
            Keywords = $keywordsToSearch
            ExportFormat = $exportFormatCombo.SelectedItem.Content.ToString()
            DelaySeconds = [int]$delayBox.Text
            MaxRetries = [int]$maxRetriesBox.Text
        }
        
        if ($useCacheCheck.IsChecked) { $searchParams['UseCache'] = $true }
        if ($openResultsCheck.IsChecked) { $searchParams['OpenResults'] = $true }
        if ($verboseCheck.IsChecked) { $searchParams['Verbose'] = $true }
        
        # Run in background job
        $script:searchJob = Start-Job -ScriptBlock {
            param($scriptPath, $params)
            & $scriptPath @params
        } -ArgumentList $scriptPath, $searchParams
        
        # Monitor job
        $script:timer = New-Object System.Windows.Threading.DispatcherTimer
        $script:timer.Interval = [TimeSpan]::FromSeconds(1)
        $script:timer.Add_Tick({
            if ($script:searchJob.State -eq "Completed") {
                $script:timer.Stop()
                
                $output = Receive-Job -Job $script:searchJob
                $output | ForEach-Object {
                    Write-Console $_
                }
                
                Remove-Job -Job $script:searchJob
                $script:searchJob = $null
                $script:isSearchRunning = $false
                
                $runSearchBtn.IsEnabled = $true
                $stopSearchBtn.IsEnabled = $false
                
                Write-Console "========================================="
                Write-Console "Search completed!"
                Write-Console "========================================="
                Update-Status "Search completed"
                
                [System.Windows.MessageBox]::Show("Search completed successfully!", "Search Complete", "OK", "Information")
            }
            elseif ($script:searchJob.State -eq "Failed") {
                $script:timer.Stop()
                
                $error = $script:searchJob.ChildJobs[0].JobStateInfo.Reason.Message
                Write-Console "ERROR: Search failed - $error"
                
                Remove-Job -Job $script:searchJob -Force
                $script:searchJob = $null
                $script:isSearchRunning = $false
                
                $runSearchBtn.IsEnabled = $true
                $stopSearchBtn.IsEnabled = $false
                Update-Status "Search failed"
                
                [System.Windows.MessageBox]::Show("Search failed: $error", "Search Error", "OK", "Error")
            }
        })
        $script:timer.Start()
    }
})

# Stop search button
$stopSearchBtn.Add_Click({
    if ($script:searchJob) {
        $result = [System.Windows.MessageBox]::Show(
            "Stop the running search?",
            "Confirm Stop",
            "YesNo",
            "Question"
        )
        
        if ($result -eq "Yes") {
            if ($script:timer) {
                $script:timer.Stop()
                $script:timer = $null
            }
            Stop-Job -Job $script:searchJob
            Remove-Job -Job $script:searchJob -Force
            $script:searchJob = $null
            $script:isSearchRunning = $false
            
            $runSearchBtn.IsEnabled = $true
            $stopSearchBtn.IsEnabled = $false
            
            Write-Console "Search stopped by user"
            Update-Status "Search stopped"
        }
    }
})

# Clear console button
$clearConsoleBtn.Add_Click({
    $consoleOutput.Clear()
})

# ============== INITIALIZATION ==============

# Bind keywords list
$keywordsList.ItemsSource = $script:keywords

# Load default keywords
Load-DefaultKeywords

# Welcome message
Write-Console "========================================="
Write-Console "SearxNG LinkedIn Collector - UI Edition"
Write-Console "========================================="
Write-Console "Ready! Load keywords or start searching."
Write-Console ""
Update-Status "Ready"

# ============== SHOW WINDOW ==============
$window.ShowDialog() | Out-Null

