import connectDB from '../lib/mongodb';
import Exam from '../models/Exam';

const exams = [
  {
    title: '순경 → 경장 승진시험',
    description: '순경에서 경장으로의 승진을 위한 시험입니다.',
    timeLimit: 20, // 20분
    totalPoints: 100,
    questions: [
      {
        type: 'ox',
        text: '동승자가 도주자에게 최초PM 2회를 찍은 상태이다. 쫓아가서 운전자가 PM를 1회 찍었다. 경찰측에서 총기 발포가 가능한가?',
        points: 10
      },
      {
        type: 'ox',
        text: '불법 주정차에 단속 기준은 5분이며, 도로교통법 집행이 가능하다.',
        points: 10
      },
      {
        type: 'multiple',
        text: '제 3장 경찰기관 봉금에 관한 규정 중 초과근무 수당 지급 제외 대상자 에 대한 항목 중 틀린것은?',
        points: 10,
        options: [
          '뇌물 수수 혐의 이력자',
          '전일 1회 이상 출근한 이력이 없는 경우',
          '내부경고 2회 누적자',
          '피크타임(23:00 ~) 이후 출근자'
        ]
      },
      {
        type: 'multiple',
        text: '조직과 도주RP중 양측이 총기를 발포하여 즉흥으로 전환됬을때 3블럭 이상으로 범위를 벗어나면 안된다 그러면 시민은 몇블럭 까지 가능한가?',
        points: 10,
        options: [
          '2블럭',
          '3블럭',
          '5블럭',
          '전체'
        ]
      },
      {
        type: 'multiple',
        text: '영장 RP의 경찰이 참여할 수 있는 최대 인원 수를 고르시오',
        points: 10,
        options: [
          '강도측 +1',
          '강도측 +2',
          '강도측 +3',
          '출근 중인 경찰 공무원 전부'
        ]
      },
      {
        type: 'multiple',
        text: '특공대 메뉴얼 무전 수칙 중 특공대가 아닌 인원이 마이크를 사용할 수 있을 때의 조건은 알맞지 않는 것을 고르시오.',
        points: 10,
        options: [
          '지휘권자의 지시에 따른 진입대기가 준비 되었을 때',
          '본인이 다운 되었을 때',
          '부여 받은 위치의 대상을 제압 하였을 때',
          '내가 현재 어디 위치에 있는지 알려줄 때'
        ]
      },
      {
        type: 'essay',
        text: '본인은 교통사고 현장을 목격했다. A와 B는 서로 누구의 과실이 큰지 의견이 대립되고 있다. 경찰의 알맞는 행동을 쓰시오.',
        points: 10
      },
      {
        type: 'essay',
        text: '도주 상황이 발생했을시, 운전자는 도주에 성공, 동승자는 제압하여 죽었을 때 어떻게 대처해야하는지 서술하시오',
        points: 10
      },
      {
        type: 'essay',
        text: '경찰서 1차와 2차 털이시 사용 가능한 스나이퍼 갯수, 샷건 갯수를 서술하시오',
        points: 10
      },
      {
        type: 'essay',
        text: '공무원 합동 RP는 어떤 것이 있는지 모두 서술하시오.',
        points: 10
      }
    ]
  },
  {
    title: '경장 → 경사 승진시험',
    description: '경장에서 경사로의 승진을 위한 시험입니다.',
    timeLimit: 30, // 30분
    totalPoints: 100,
    questions: [
      {
        type: 'ox',
        text: '경찰공무원법상 경찰공무원은 정당 기타 정치단체의 결성에 관여하거나 이에 가입할 수 있다.',
        points: 10
      },
      {
        type: 'ox',
        text: '경찰공무원법상 경찰공무원은 정당 기타 정치단체의 결성에 관여하거나 이에 가입할 수 있다.',
        points: 10
      },
      {
        type: 'multiple',
        text: '다음 중 경찰공무원법상 경찰공무원의 의무가 아닌 것은?',
        options: [
          '성실의무',
          '복종의무',
          '직장이탈금지의무',
          '정치운동의무'
        ],
        points: 10
      },
      {
        type: 'multiple',
        text: '다음 중 경찰공무원법상 경찰공무원의 신분보장에 대한 설명으로 옳은 것은?',
        options: [
          '경찰공무원은 형의 선고에 의하지 아니하고는 파면되지 않는다.',
          '경찰공무원은 징계처분에 의하지 아니하고는 강임되지 않는다.',
          '경찰공무원은 본인의 동의가 없으면 강임되거나 면직되지 않는다.',
          '경찰공무원은 정년에 이르면 당연히 퇴직된다.'
        ],
        points: 10
      },
      {
        type: 'essay',
        text: '경찰공무원법상 경찰공무원의 정치적 중립성에 대해 설명하시오.',
        points: 20
      },
      {
        type: 'essay',
        text: '경찰공무원법상 경찰공무원의 복무에 대한 기본원칙에 대해 설명하시오.',
        points: 20
      },
      {
        type: 'essay',
        text: '경찰공무원법상 경찰공무원의 의무에 대해 설명하시오.',
        points: 20
      }
    ]
  },
  {
    title: '경사 → 경위 승진시험',
    description: '경사에서 경위로의 승진을 위한 시험입니다.',
    timeLimit: 40, // 40분
    totalPoints: 100,
    questions: [
      {
        type: 'ox',
        text: '경찰공무원법상 경찰공무원은 정당 기타 정치단체의 결성에 관여하거나 이에 가입할 수 있다.',
        points: 10
      },
      {
        type: 'ox',
        text: '경찰공무원법상 경찰공무원은 정당 기타 정치단체의 결성에 관여하거나 이에 가입할 수 있다.',
        points: 10
      },
      {
        type: 'multiple',
        text: '다음 중 경찰공무원법상 경찰공무원의 의무가 아닌 것은?',
        options: [
          '성실의무',
          '복종의무',
          '직장이탈금지의무',
          '정치운동의무'
        ],
        points: 10
      },
      {
        type: 'multiple',
        text: '다음 중 경찰공무원법상 경찰공무원의 신분보장에 대한 설명으로 옳은 것은?',
        options: [
          '경찰공무원은 형의 선고에 의하지 아니하고는 파면되지 않는다.',
          '경찰공무원은 징계처분에 의하지 아니하고는 강임되지 않는다.',
          '경찰공무원은 본인의 동의가 없으면 강임되거나 면직되지 않는다.',
          '경찰공무원은 정년에 이르면 당연히 퇴직된다.'
        ],
        points: 10
      },
      {
        type: 'essay',
        text: '경찰공무원법상 경찰공무원의 정치적 중립성에 대해 설명하시오.',
        points: 20
      },
      {
        type: 'essay',
        text: '경찰공무원법상 경찰공무원의 복무에 대한 기본원칙에 대해 설명하시오.',
        points: 20
      },
      {
        type: 'essay',
        text: '경찰공무원법상 경찰공무원의 의무에 대해 설명하시오.',
        points: 20
      }
    ]
  }
];

async function seed() {
  try {
    await connectDB();
    await Exam.deleteMany({});
    await Exam.insertMany(exams);
    console.log('시험 데이터가 성공적으로 추가되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('시험 데이터 추가 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

seed(); 