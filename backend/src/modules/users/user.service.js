const prisma = require('../../config/prisma');

class UserService {
    async updateUser(userId, data) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                displayName: data.displayName,
                avatar: data.avatar
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatar: true,
                rating: true,
                wins: true,
                losses: true,
                draws: true,
                problemsSolved: true
            }
        });
    }

    async getUserSubmissions(userId, { limit = 10, offset = 0 } = {}) {
        const submissions = await prisma.submissions.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset,
            include: {
                problems: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true
                    }
                }
            }
        });

        // Map BIGINT to string to avoid JSON serialization errors
        return submissions.map(sub => ({
            ...sub,
            id: sub.id ? sub.id.toString() : null,
            problem_id: sub.problem_id ? sub.problem_id.toString() : null,
            problems: sub.problems ? {
                ...sub.problems,
                id: sub.problems.id ? sub.problems.id.toString() : null
            } : null
        }));
    }

    async getSolvedProblems(userId) {
        const solved = await prisma.userProblemStatus.findMany({
            where: { 
                userId,
                status: 'Accepted'
            },
            include: {
                problem: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true
                    }
                }
            }
        });

        // Map BIGINT to string
        return solved.map(s => ({
            ...s,
            problemId: s.problemId ? s.problemId.toString() : null,
            problem: s.problem ? {
                ...s.problem,
                id: s.problem.id ? s.problem.id.toString() : null
            } : null
        }));
    }
}

module.exports = new UserService();
