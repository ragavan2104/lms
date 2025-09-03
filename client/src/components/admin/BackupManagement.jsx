import React, { useState, useEffect } from 'react'
import './BackupManagement.css'
import { Database, Download, Trash2, Shield, Clock, HardDrive, RefreshCw, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const BackupManagement = () => {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [creatingSqlBackup, setCreatingSqlBackup] = useState(false)
  const [settings, setSettings] = useState(null)
  const [selectedBackups, setSelectedBackups] = useState([])

  useEffect(() => {
    fetchBackups()
    fetchSettings()
  }, [])

  const fetchBackups = async () => {
    try {
      const response = await api.get('/admin/backup/list')
      setBackups(response.data.backups || [])
    } catch (error) {
      console.error('Failed to fetch backups:', error)
      toast.error('Failed to load backups')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/backup/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to fetch backup settings:', error)
    }
  }

  const createManualBackup = async () => {
    setCreatingBackup(true)
    const loadingToast = toast.loading('Creating complete backup (DB + SQL)...')
    
    try {
      const response = await api.post('/admin/backup/create')
      toast.dismiss(loadingToast)
      toast.success('Complete backup created successfully!')
      
      // Refresh backup list
      await fetchBackups()
      
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Backup creation failed:', error)
      toast.error(error.response?.data?.error || 'Failed to create backup')
    } finally {
      setCreatingBackup(false)
    }
  }

  const createSqlBackup = async () => {
    setCreatingSqlBackup(true)
    const loadingToast = toast.loading('Creating SQL backup...')
    
    try {
      const response = await api.post('/admin/backup/create-sql')
      toast.dismiss(loadingToast)
      toast.success('SQL backup created successfully!')
      
      // Refresh backup list
      await fetchBackups()
      
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('SQL backup creation failed:', error)
      toast.error(error.response?.data?.error || 'Failed to create SQL backup')
    } finally {
      setCreatingSqlBackup(false)
    }
  }

  const downloadBackup = async (filename) => {
    try {
      const response = await api.get(`/admin/backup/download/${filename}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Backup ${filename} downloaded successfully`)
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download backup')
    }
  }

  const deleteBackup = async (filename) => {
    if (!confirm(`Are you sure you want to delete backup "${filename}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/admin/backup/delete/${filename}`)
      toast.success(`Backup ${filename} deleted successfully`)
      
      // Refresh backup list
      await fetchBackups()
      setSelectedBackups(selectedBackups.filter(f => f !== filename))
      
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error(error.response?.data?.error || 'Failed to delete backup')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const handleSelectBackup = (filename) => {
    setSelectedBackups(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    )
  }

  const handleSelectAll = () => {
    if (selectedBackups.length === backups.length) {
      setSelectedBackups([])
    } else {
      setSelectedBackups(backups.map(b => b.filename))
    }
  }

  const deleteSelectedBackups = async () => {
    if (selectedBackups.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedBackups.length} selected backup(s)?\n\nThis action cannot be undone.`)) {
      return
    }

    const loadingToast = toast.loading(`Deleting ${selectedBackups.length} backup(s)...`)
    
    try {
      await Promise.all(selectedBackups.map(filename => 
        api.delete(`/admin/backup/delete/${filename}`)
      ))
      
      toast.dismiss(loadingToast)
      toast.success(`Successfully deleted ${selectedBackups.length} backup(s)`)
      
      // Refresh backup list
      await fetchBackups()
      setSelectedBackups([])
      
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Bulk delete failed:', error)
      toast.error('Failed to delete some backups')
    }
  }

  if (loading) {
    return <div className="loading">Loading backup management...</div>
  }

  return (
    <div className="backup-management">
      <div className="page-header">
        <div>
          <h1>Database Backup Management</h1>
          <p>Create, manage, and restore database backups</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={createManualBackup}
            disabled={creatingBackup || creatingSqlBackup}
          >
              {creatingBackup ? (
                  <>
                <RefreshCw size={16} className="spinning" />
                Creating Complete Backup...
              </>
            ) : (
              <>
                <Database size={16} />
                Create Complete Backup
              </>
            )}
          </button>
          <button
            className="btn btn-success"
            onClick={createSqlBackup}
            disabled={creatingBackup || creatingSqlBackup}
          >
            {creatingSqlBackup ? (
              <>
                <RefreshCw size={16} className="spinning" />
                Creating SQL Backup...
              </>
            ) : (
              <>
                <FileText size={16} />
                Create SQL Backup
              </>
            )}
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchBackups}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Manual Backup Section */}
      <div className="manual-backup-section">
        <div className="section-header">
          <h2>Manual Backup Options</h2>
          <p>Create immediate backups of your database with different formats</p>
        </div>
        <div className="backup-options-grid">
          <div className="backup-option-card">
            <div className="option-icon">
              <Database size={32} color="#3b82f6" />
            </div>
            <div className="option-content">
              <h3>Complete Backup</h3>
              <p>Creates both database (.db) and SQL (.sql) files for maximum compatibility</p>
              <button
                className="btn btn-primary btn-wide"
                onClick={createManualBackup}
                disabled={creatingBackup || creatingSqlBackup}
              >
                {creatingBackup ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Create Complete Backup
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="backup-option-card">
            <div className="option-icon">
              <FileText size={32} color="#10b981" />
            </div>
            <div className="option-content">
              <h3>SQL Backup Only</h3>
              <p>Creates only SQL dump file - perfect for data migration and portability</p>
              <button
                className="btn btn-success btn-wide"
                onClick={createSqlBackup}
                disabled={creatingBackup || creatingSqlBackup}
              >
                {creatingSqlBackup ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Create SQL Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings Overview */}
      {settings && (
        <div className="backup-settings-overview">
          <div className="settings-grid">
            <div className="setting-card">
              <div className="setting-icon">
                <Shield size={24} color="#10b981" />
              </div>
              <div className="setting-info">
                <h4>Auto Backup</h4>
                <p>{settings.auto_backup_enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <div className="setting-card">
              <div className="setting-icon">
                <Clock size={24} color="#3b82f6" />
              </div>
              <div className="setting-info">
                <h4>Backup Interval</h4>
                <p>Every {settings.backup_interval_days} days</p>
              </div>
            </div>
            <div className="setting-card">
              <div className="setting-icon">
                <HardDrive size={24} color="#8b5cf6" />
              </div>
              <div className="setting-info">
                <h4>Max Backups</h4>
                <p>{settings.max_backups_to_keep} backups kept</p>
              </div>
            </div>
            <div className="setting-card">
              <div className="setting-icon">
                <Database size={24} color="#f59e0b" />
              </div>
              <div className="setting-info">
                <h4>Total Backups</h4>
                <p>{backups.length} backup files</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Instructions */}
      <div className="backup-instructions">
        <div className="instruction-card">
          <AlertCircle size={20} color="#3b82f6" />
          <div>
            <h4>Backup Information</h4>
            <ul>
              <li><strong>Automatic Backups:</strong> Created every 7 days automatically</li>
              <li><strong>Manual Backups:</strong> Create on-demand backups anytime</li>
              <li><strong>File Types:</strong> Both .db (database) and .sql (SQL dump) files are created</li>
              <li><strong>Storage:</strong> Backups are stored locally on the server</li>
              <li><strong>Retention:</strong> Only the most recent 30 backups are kept</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backup Actions */}
      {backups.length > 0 && (
        <div className="backup-actions">
          <div className="bulk-actions">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={selectedBackups.length === backups.length}
                onChange={handleSelectAll}
              />
              Select All ({backups.length})
            </label>
            {selectedBackups.length > 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={deleteSelectedBackups}
              >
                <Trash2 size={14} />
                Delete Selected ({selectedBackups.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Backups Table */}
      <div className="backups-table">
        {backups.length === 0 ? (
          <div className="empty-state">
            <Database size={48} color="#9ca3af" />
            <h3>No Backups Found</h3>
            <p>Create your first backup to get started</p>
            <button className="btn btn-primary" onClick={createManualBackup}>
              <Database size={16} />
              Create First Backup
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedBackups.length === backups.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Filename</th>
                <th>Type</th>
                <th>Size</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.filename}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBackups.includes(backup.filename)}
                      onChange={() => handleSelectBackup(backup.filename)}
                    />
                  </td>
                  <td>
                    <div className="backup-filename">
                      <Database size={16} color="#3b82f6" />
                      {backup.filename}
                    </div>
                  </td>
                  <td>
                    <span className={`backup-type ${backup.type.toLowerCase()}`}>
                      {backup.type}
                    </span>
                  </td>
                  <td>{formatFileSize(backup.size)}</td>
                  <td>{formatDate(backup.created_at)}</td>
                  <td>
                    <div className="backup-actions">
                      <button
                        className="btn-icon"
                        onClick={() => downloadBackup(backup.filename)}
                        title="Download backup"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => deleteBackup(backup.filename)}
                        title="Delete backup"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Backup Statistics */}
      {backups.length > 0 && (
        <div className="backup-stats">
          <div className="stat-item">
            <strong>Total Backups:</strong> {backups.length}
          </div>
          <div className="stat-item">
            <strong>Total Size:</strong> {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
          </div>
          <div className="stat-item">
            <strong>Latest Backup:</strong> {backups.length > 0 ? formatDate(backups[0].created_at) : 'None'}
          </div>
        </div>
      )}
    </div>
  )
}

export default BackupManagement
