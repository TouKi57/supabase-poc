// pages/dashboard.tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabaseClient } from '../lib/supabaseClient'
import { useUserProjects, Project } from '../hooks/useUserProjects'
import Modal from '../components/Modal'

export default function Dashboard() {
    const router = useRouter()
    const { projects, loading, error } = useUserProjects()

    // Create Project state
    const [newName, setNewName] = useState('')
    const [newDetails, setNewDetails] = useState('')
    const [creating, setCreating] = useState(false)

    // Join Project state
    const [inviteUrl, setInviteUrl] = useState('')
    const [joinError, setJoinError] = useState<string|null>(null)
    const [joining, setJoining] = useState(false)

    // Invite Modal state
    const [selectedProject, setSelectedProject] = useState<Project|null>(null)
    const [inviteLink, setInviteLink]         = useState('')
    const [modalOpen, setModalOpen]           = useState(false)

    // Redirect if not signed in
    useEffect(() => {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (!session) router.replace('/auth/signin')
        })
    }, [router])

    // Handler: create a new project
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        const { data: { session } } = await supabaseClient.auth.getSession()
        if (!session?.access_token) {
            return router.replace('/auth/signin')
        }

        const res = await fetch('/api/projects/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ name: newName, details: newDetails }),
        })
        await res.json()
        setNewName('')
        setNewDetails('')
        setCreating(false)
        router.replace(router.asPath)
    }

    // Handler: join by pasted invite link
    const handleJoinByLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setJoinError(null)
        setJoining(true)

        // extract token
        const m = inviteUrl.match(/\/projects\/join\/([^/?#]+)/)
        const token = m?.[1]
        if (!token) {
            setJoinError('Invalid invite link format.')
            setJoining(false)
            return
        }

        const { data: { session } } = await supabaseClient.auth.getSession()
        if (!session?.access_token) {
            setJoinError('You must sign in first.')
            setJoining(false)
            router.replace('/auth/signin')
            return
        }

        const res = await fetch(`/api/projects/join/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
        })
        const text = await res.text()
        let payload: any
        try { payload = JSON.parse(text) }
        catch {
            setJoinError('Unexpected server response.')
            setJoining(false)
            return
        }
        if (!res.ok) {
            setJoinError(payload.error || 'Failed to join.')
            setJoining(false)
            return
        }

        setInviteUrl('')
        setJoining(false)
        router.replace(router.asPath)
    }

    // Handler: open invite-modal for a project
    const openInviteModal = async (project: Project) => {
        setSelectedProject(project)
        const { data: { session } } = await supabaseClient.auth.getSession()
        if (!session?.access_token) return

        const res = await fetch(`/api/projects/${project.id}/invite`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const { inviteLink } = await res.json()
        setInviteLink(inviteLink)
        setModalOpen(true)
    }

    if (loading) return <p>Loading projects…</p>
    if (error)   return <p className="text-red-600">Error: {error}</p>

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Join Project */}
            <section className="section">
                <h2 className="text-xl font-semibold mb-2">Join a Project</h2>
                {joinError && <p className="text-red-600 mb-2">{joinError}</p>}
                <form onSubmit={handleJoinByLink} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded"
                        placeholder="Paste invite link here"
                        value={inviteUrl}
                        onChange={e => setInviteUrl(e.target.value)}
                        disabled={joining}
                    />
                    <button
                        type="submit"
                        disabled={joining}
                        className="btn btn-signin"
                    >
                        {joining ? 'Joining…' : 'Join'}
                    </button>
                </form>
            </section>

            {/* Create Project */}
            <section className="section">
                <h2 className="text-xl font-semibold mb-2">Create New Project</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Project Name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <textarea
                        className="w-full p-2 border rounded"
                        placeholder="Details (optional)"
                        rows={3}
                        value={newDetails}
                        onChange={e => setNewDetails(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={creating}
                        className="btn btn-signin"
                    >
                        {creating ? 'Creating…' : 'Create Project'}
                    </button>
                </form>
            </section>

            {/* Project List */}
            <section className="section">
                <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
                {projects.length === 0 ? (
                    <p>You have no projects yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {projects.map(p => (
                            <li
                                key={p.id}
                                className="border p-4 rounded flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-lg font-medium">{p.name}</h3>
                                    {p.details && <p className="text-gray-700">{p.details}</p>}
                                </div>
                                <button
                                    onClick={() => openInviteModal(p)}
                                    className="btn btn-signin text-sm"
                                >
                                    Invite
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Invite Link Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Invite Link"
            >
                <p className="break-all mb-4">{inviteLink}</p>
                <button
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                    className="btn btn-signin"
                >
                    Copy to Clipboard
                </button>
            </Modal>
        </div>
    )
}
