import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const payments = await prisma.manualPayment.findMany({ orderBy: { id: 'asc' } })
  res.json(payments)
})

router.post('/', async (req: Request, res: Response) => {
  const { paymentType, holderName, accountNumber, ifscCode, upiId, qrImageUrl } = req.body
  const payment = await prisma.manualPayment.create({
    data: { paymentType, holderName, accountNumber, ifscCode, upiId, qrImageUrl },
  })
  res.status(201).json(payment)
})

router.put('/:id', async (req: Request, res: Response) => {
  const { paymentType, holderName, accountNumber, ifscCode, upiId, qrImageUrl, isActive } = req.body
  const payment = await prisma.manualPayment.update({
    where: { id: parseInt(req.params.id) },
    data: { paymentType, holderName, accountNumber, ifscCode, upiId, qrImageUrl, isActive },
  })
  res.json(payment)
})

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.manualPayment.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Deleted' })
})

export default router
