'use client'
import placeholderImg from '@/assets/placeholder-image.webp'
import EditLotForm from '@/components/EditLotForm'
import { useUserContext } from '@/context/UserContext'
import {
	useAllLots,
	useAllLotsBySellerId,
	useLotCounts,
	useMarkDeletedMutation,
} from '@/queries/lots'
import { getStorageItem } from '@/utils/storage'
import {
	Add,
	AttachMoney,
	BarChart,
	Delete,
	Edit,
	Gavel,
	Replay,
	ShowChart,
	ThumbUp,
} from '@mui/icons-material'
import {
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Divider,
	Grid,
	LinearProgress,
	Modal,
	Tooltip,
	Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// Helper function to calculate the remaining time
const calculateRemainingTime = (targetTime) => {
	const now = new Date()
	const difference = new Date(targetTime) - now
	if (difference <= 0) return null

	const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
	const minutes = Math.floor((difference / (1000 * 60)) % 60)
	const seconds = Math.floor((difference / 1000) % 60)

	return `${hours}h ${minutes}m ${seconds}s`
}

function MyLots() {
	const sellerId = useRef(getStorageItem('userId')).current
	const token = useRef(getStorageItem('token')).current
	const [page, setPage] = useState(0)
	const { data: lots, refetch: refetchSellerId } = useAllLotsBySellerId(
		sellerId,
		page,
		20,
	)
	const { refetch: refetchAll } = useAllLots(0, 20)

	const handleNextPage = () => setPage((prev) => prev + 1)
	const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 0))

	const [editLot, setEditLot] = useState(null)
	const [isModalOpen, setModalOpen] = useState(false)
	const [isStatModalOpen, setStatModalOpen] = useState(false)
	const [lotStats, setLotStats] = useState(null)
	const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
	const [lotToDelete, setLotToDelete] = useState(null)
	const queryClient = useQueryClient()
	const { user } = useUserContext()
	const { data: lotStatsData } = useLotCounts(lotStats?.id)
	const intl = useIntl()
	const MySwal = withReactContent(Swal)
	// const user = userResponse?.data || "";

	const { mutate: deleteLot } = useMarkDeletedMutation(
		() => {
			toast.success('Lot deleted successfully!')
			refetchSellerId()
			refetchAll()
		},
		(error) => {
			toast.error('Failed to delete lot.')
			console.error(error)
		},
	)

	const handleDelete = (lot) => {
		MySwal.fire({
			title: intl.formatMessage({ id: 'confirm_title' }),
			text: intl.formatMessage({ id: 'confirm_text' }),
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: intl.formatMessage({ id: 'confirm_delete' }),
			cancelButtonText: intl.formatMessage({ id: 'cancel' }),
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
		}).then((result) => {
			if (result.isConfirmed) {
				deleteLot(lot.id)
			}
		})
	}
	const handleEdit = (lot) => {
		setEditLot(lot)
		setModalOpen(true)
	}

	const handleStats = (lot) => {
		setLotStats(lot)
		setStatModalOpen(true)
	}

	const closeModal = () => {
		setModalOpen(false)
		setEditLot(null)
		refetchSellerId()
	}

	const closeStatModal = () => {
		setStatModalOpen(false)
		setLotStats(null)
		// queryClient.invalidateQueries("lotsBySellerId");
	}

	// Timer logic for each lot
	const [timers, setTimers] = useState({})

	useEffect(() => {
		if (!lots) return

		const interval = setInterval(() => {
			const updatedTimers = {}
			lots.forEach((lot) => {
				const now = new Date()
				if (now < new Date(lot.startTime)) {
					updatedTimers[lot.id] =
						`${intl.formatMessage({ id: 'startsin' })}: ${calculateRemainingTime(lot.startTime)}`
				} else if (now < new Date(lot.endTime)) {
					updatedTimers[lot.id] =
						`${intl.formatMessage({ id: 'endsin' })}: ${calculateRemainingTime(lot.endTime)}`
				} else {
					updatedTimers[lot.id] = intl.formatMessage({ id: 'auctended' })
				}
			})
			setTimers(updatedTimers)
		}, 1000)

		return () => clearInterval(interval)
	}, [lots])

	return (
		<Box sx={{}} className='space-y-5'>
			<div className='flex justify-between'>
				<h1 className='text-2xl font-semibold px-4'>
					<FormattedMessage id='Mylots' />
				</h1>
				<Link
					href='/dashboard/createlot'
					className={`hover:bg-primary-light bg-primary text-white py-1 px-2 rounded-full transition-all flex items-center`}
				>
					<Add />
					<Typography pr={1}>
						<FormattedMessage id='dashboard.createLot' />
					</Typography>
				</Link>
			</div>
			<Divider />
			{lots?.length === 0 ? (
				<Box
					display='flex'
					flexDirection='column'
					justifyContent='center'
					alignItems='center'
					height='50vh'
					textAlign='center'
				>
					<Typography variant='h6' color='text.secondary'>
						<FormattedMessage id='dashboard.nolots' />
					</Typography>
					<Typography variant='body1' mt={1}>
						<FormattedMessage id='dashboard.create' />
					</Typography>
				</Box>
			) : (
				<Grid container spacing={3} my={2}>
					{lots?.map((lot) => (
						<Grid item xs={12} sm={6} md={4} key={lot.id}>
							<Card
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									boxShadow: 3,
									borderRadius: 2,
									position: 'relative',
									transition: 'transform 0.3s ease',
									'&:hover': { transform: 'scale(1.02)' },
								}}
							>
								<Link href={`/lots/${lot.id}`}>
									<CardMedia
										component='img'
										image={lot.lotImageDtoList?.[0]?.imageUrl || placeholderImg}
										alt={lot.title}
										sx={{ height: 180, borderRadius: '8px 8px 0 0' }}
									/>
								</Link>
								<CardContent sx={{ flexGrow: 1 }}>
									<Link href={`/lots/${lot.id}`}>
										<Typography
											variant='h6'
											gutterBottom
											noWrap
											sx={{ fontWeight: 'bold', color: 'primary.main' }}
										>
											{lot.title}
										</Typography>
									</Link>
									<Typography
										variant='body2'
										color='text.secondary'
										sx={{
											overflow: 'hidden',
											display: '-webkit-box',
											WebkitBoxOrient: 'vertical',
											WebkitLineClamp: 3,
										}}
									>
										{lot.description || 'No description available.'}
									</Typography>
									<Divider sx={{ my: 2 }} />
									<Box
										display='flex'
										justifyContent='space-between'
										alignItems='center'
										mb={1}
									>
										<Chip
											label={
												lot.isApproved === true
													? intl.formatMessage({ id: 'lots.approved' })
													: lot.isApproved === false
														? intl.formatMessage({ id: 'lots.declined' })
														: intl.formatMessage({ id: 'lots.pending' })
											}
											color={
												lot.isApproved === true
													? 'success'
													: lot.isApproved === false
														? 'error'
														: 'inherit'
											}
											size='small'
										/>
										<Typography variant='body2' color='text.secondary'>
											<strong>
												{(() => {
													try {
														const parsedName = lot.lotType.name
														return (
															parsedName[intl.locale] ||
															parsedName.en ||
															'Unknown'
														)
													} catch (error) {
														return 'Unknown'
													}
												})()}
											</strong>
										</Typography>
									</Box>
									<Box
										display='flex'
										justifyContent='space-between'
										alignItems='center'
									>
										<Box display='flex' alignItems='center' gap={0.5}>
											{/* <AttachMoney fontSize="small" /> */}
											<Typography variant='body1'>
												{lot.startPrice.toLocaleString()} UZS
											</Typography>
										</Box>
										<Box display='flex' alignItems='center' gap={0.5}>
											<ShowChart fontSize='small' />
											<Typography variant='body2' color='text.secondary'>
												{lot.incrementValue.toLocaleString()}
												{lot.incrementType === 'PERCENTAGE' && '%'}{' '}
												{lot.incrementType === 'FIXED' && 'UZS'}
											</Typography>
										</Box>
									</Box>
									<Typography variant='body2' color='text.secondary' mt={2}>
										{timers[lot.id]}
									</Typography>
								</CardContent>
								{lot.lotStatus !== 'DELETED' && (
									<Box
										display='flex'
										justifyContent='end'
										gap='4px'
										alignItems='center'
										p={2}
									>
										<Tooltip title={intl.formatMessage({ id: 'lot.stats' })}>
											<Button
												variant='contained'
												color='primary'
												onClick={() => handleStats(lot)}
												size='small'
											>
												<BarChart />
											</Button>
										</Tooltip>
										<Tooltip title={intl.formatMessage({ id: 'lot.edit' })}>
											<Button
												variant='contained'
												color='primary'
												onClick={() => handleEdit(lot)}
												size='small'
											>
												{lot.isApproved !== false ? <Edit /> : <Replay />}
											</Button>
										</Tooltip>
										<Tooltip title={intl.formatMessage({ id: 'lot.delete' })}>
											<Button
												variant='outlined'
												color='error'
												onClick={() => handleDelete(lot)}
												size='small'
											>
												<Delete />
											</Button>
										</Tooltip>
									</Box>
								)}
								<div className='absolute bg-primary text-white px-3 py-1 w-[100%] text-center'>
									<FormattedMessage id='lot' /> № {lot.id}
								</div>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* <Box display="flex" justifyContent="center" mt={3}>
        <Button onClick={handlePreviousPage} disabled={page === 0}>
          Previous
        </Button>
        <Button onClick={handleNextPage} disabled={lots?.length < 20}>
          Next
        </Button>
      </Box> */}

			{/* Modal for Editing Lot */}
			<Modal open={isModalOpen} onClose={closeModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						bgcolor: 'background.paper',
						borderRadius: 2,
						p: 3,
						width: { xs: '90%', md: '60%' },
						maxHeight: '80vh',
						overflowY: 'auto',
					}}
				>
					{editLot && <EditLotForm lot={editLot} onClose={closeModal} />}
				</Box>
			</Modal>

			<Modal
				open={isStatModalOpen}
				onClose={closeStatModal}
				sx={{ zIndex: '9999' }}
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						bgcolor: 'background.paper',
						borderRadius: 3,
						p: 4,
						width: { xs: '90%', md: '50%' },
						maxHeight: '80vh',
						overflowY: 'auto',
						boxShadow: 4,
					}}
				>
					{lotStatsData && (
						<Box>
							<Typography
								variant='h5'
								fontWeight='bold'
								mb={2}
								textAlign='center'
							>
								<FormattedMessage id='lotstats' />
							</Typography>

							{/* Grid layout for statistics */}
							<Grid container spacing={2}>
								<StatCard
									icon={
										<ThumbUp sx={{ fontSize: 40, color: 'primary.main' }} />
									}
									title={intl.formatMessage({ id: 'lot.likes' })}
									value={lotStatsData?.likeCount}
								/>
								<StatCard
									icon={
										<AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
									}
									title={intl.formatMessage({ id: 'lot.deposits' })}
									value={lotStatsData?.depositCount}
								/>
								<StatCard
									icon={<Gavel sx={{ fontSize: 40, color: 'info.main' }} />}
									title={intl.formatMessage({ id: 'lot.bids' })}
									value={lotStatsData?.bidCount}
								/>
							</Grid>

							<Divider sx={{ my: 3 }} />

							{/* Performance Summary */}
							<Card
								elevation={3}
								sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}
							>
								<Typography variant='h6' color='textSecondary' gutterBottom>
									<FormattedMessage id='lotperf' />
								</Typography>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										my: 2,
									}}
								>
									<BarChart sx={{ fontSize: 60, color: 'primary.main' }} />
								</Box>
								{/* <Typography variant="body2" color="textSecondary">
                  Engagement and participation in this lot have been strong!
                </Typography> */}
								<Box mt={2}>
									<Typography variant='body2' color='textSecondary' mb={1}>
										<FormattedMessage id='lotactivity' />
									</Typography>
									<LinearProgress
										variant='determinate'
										value={Math.min((lotStatsData?.bidCount / 50) * 100, 100)}
										sx={{ height: 8, borderRadius: 4 }}
									/>
								</Box>
							</Card>
						</Box>
					)}
				</Box>
			</Modal>
		</Box>
	)
}

export default MyLots

function StatCard({ icon, title, value }) {
	return (
		<Grid item xs={12} sm={4}>
			<Card
				sx={{
					display: 'flex',
					alignItems: 'center',
					p: 2,
					borderRadius: 3,
					boxShadow: 2,
					transition: 'transform 0.2s',
					'&:hover': { transform: 'scale(1.05)' },
				}}
			>
				{icon}
				<CardContent sx={{ textAlign: 'left' }}>
					<Typography variant='body2' color='textSecondary'>
						{title}
					</Typography>
					<Typography variant='h5' fontWeight='bold'>
						{value}
					</Typography>
				</CardContent>
			</Card>
		</Grid>
	)
}
