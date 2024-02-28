import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  userSignUp = async (data) => {
    try {
      const {
        email,
        clientId,
        password,
        name,
        nickname,
        phone,
        address,
        role,
      } = data;
      if (clientId) {
        const user =
          await this.userRepository.selectOneUserByClientId(clientId);
        if (user) {
          throw {
            code: 401,
            message: '이미 가입된 사용자입니다.',
          };
        }

        await this.userRepository.createUser({
          clientId,
          name,
          nickname,
          phone,
          address,
          role,
        });
      } else {
        const user = await this.userRepository.selectOneUserByEmail(email);
        if (user) {
          throw {
            code: 401,
            message: '이미 가입한 이메일입니다.',
          };
        }

        await this.userRepository.createUser({
          email,
          password: await bcrypt.hash(password, 10),
          name,
          nickname,
          phone,
          address,
          role,
        });
      }
    } catch (err) {
      throw err;
    }
  };

  userSignIn = async ({ clientId, email, password }) => {
    try {
      let user;
      if (clientId) {
        // 카카오 로그인
        user = await userRepository.selectOneUserByClientId(clientId);

        if (!user) {
          throw {
            code: 400,
            message: '올바르지 않은 로그인 정보입니다.',
          };
        }
      } else {
        // email 로그인
        if (!email) {
          throw {
            code: 400,
            message: '이메일은 필수값입니다.',
          };
        }

        if (!password) {
          throw {
            code: 400,
            message: '비밀번호는 필수값입니다.',
          };
        }

        user = await this.userRepository.selectOneUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
          throw {
            code: 401,
            message: '올바르지 않은 로그인 정보입니다.',
          };
        }
      }

      // 로그인 성공
      const accessToken = jwt.sign(
        { userId: user.userId },
        process.env.ACCESS_SECRET_KEY,
        {
          expiresIn: '12h',
        }
      );
      const refreshToken = jwt.sign(
        { userId: user.userId },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: '7d' }
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      throw err;
    }
  };

  getUserById = async (userId) => {
    try {
      const user = await this.userRepository.findOneUserByUserId(userId);

      if (!user) {
        throw {
          code: 401,
          message: '올바르지 않은 로그인 정보입니다.',
        };
      }

      if (user.role === 'CUSTOMER') {
        return {
          nickname: user.nickname,
          email: user.email,
          createdAt: user.createdAt,
        };
      } else if (user.role === 'OWNER') {
        const store = await this.userRepository.getStoreByOwnerId(userId);
        return {
          nickname: user.nickname,
          email: user.email,
          storeName: store.storeName,
          createdAt: store.createdAt,
        };
      }
    } catch (err) {
      throw err;
    }
  };

  updateUser = async (userId, data) => {
    try {
      const user = await this.userRepository.findOneUserByUserId(userId);

      if (!user) {
        throw {
          code: 401,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      const updatedUser = await this.userRepository.updateUserByUserId(
        userId,
        data
      );
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };
}
