import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class StorySeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const storyCount = await this.prisma.story.count();

    const storyData = [
      {
        title: 'Small things can change everything',
        abstract:
          'Giữa thế giới mênh mông rộng lớn, bao la này, giữa sự bộn bề lo toan, giữa vòng xoáy nhộn nhịp của xã hội, có bao giờ bạn tự hỏi: “ Giá trị của bản thân mình là gì?”\n' +
          'Với mình hành trình tình nguyện tại “Xóm Cóc- Hòa Bình” là một chuyến đi đã thức tỉnh hoàn toàn trong tâm hồn mình – một người từng đánh mất đi khái niệm về giá trị của bản thân. Khi đặt chân đến đây mình không khỏi ngỡ ngàng trước cảnh sắc thiên nhiên hùng vĩ nhưng cũng đầy khó khăn của cuộc sống người dân. Mọi thứ đều giản dị, mộc mạc, và đôi khi thật khó khăn để sinh sống tại đây. Trong những giây phút đầu tiên mình cảm nhận rõ sự bỡ ngỡ và yếu đuối của bản thân khi đối diện với cuộc sống thiếu thốn nơi đây. Nhưng chính những thử thách ấy lại là những bài học quý giá giúp mình dần nhận ra những giá trị thực sự trong cuộc sống.\n' +
          'Tại Xóm Cóc, mình không chỉ là một người tình nguyện, mà còn là một người học hỏi, một người khám phá lại chính mình. Mình bắt đầu tìm thấy sự bình yên trong những hoạt động như dạy trẻ em học chữ, cùng người dân sửa sang lại nhà văn hóa,... Mình nhận ra rằng đôi khi chúng ta không cần phải làm những điều lớn lao để cảm nhận được ý nghĩa cuộc sống. Chính những hành động nhỏ bé từ tấm lòng chân thành mới là điều có thể thay đổi cả một cộng đồng.\n' +
          'Từ chuyến đi mình mang về không chỉ những kỷ niệm đẹp mà còn là những giá trị nhân văn sâu sắc. Đó là lòng kiên nhẫn, sự sẻ chia và tinh thần đoàn kết. Mình học được cách sống giản đơn hơn, yêu thương hơn và quan trọng nhất là biết cảm nhận giá trị của những điều mình đang có. Mọi người nơi đây dù sống trong điều kiện thiếu thốn nhưng họ luôn biết sẻ chia, biết yêu thương nhau và sống với trái tim ấm áp . Đặc biệt hơn cả là khi mình được tiếp xúc và trò chuyện với các trẻ em tại xóm, những tiếng cười nói từ những đôi mắt ngây thơ nhưng chất chứa đầy hoài bão khiến lòng mình nghẹn ngào. Có lẽ với mình hạnh phúc thật xa xỉ nhưng với các em đó chỉ đơn giản là những bộ quần áo cũ được từ thiện, những bữa cơm đầm ấm bên gia đình vậy là đủ rồi...\n' +
          'Tất cả những khoảnh khắc kì diệu ấy không chỉ giúp mình tìm lại bản thân mà còn giúp mình nhận ra rằng mỗi người đều có thể lan tỏa giá trị đến cộng đồng xung quanh mình bằng những điều giản đơn nhất. Đôi khi giá trị ấy không phải là những điều to lớn mà chính là sự quan tâm sẻ chia và một tấm lòng rộng mở. Qua câu chuyện trên mình muốn gửi gắm tới mọi người rằng: “ Khi bạn thật sự cống hiến không chỉ bằng sức lực mà bằng cả trái tim thì bạn sẽ nhận lại được vô vàn niềm vui, sự bình yên trong tâm hồn và những thay đổi tích cực ấy không chỉ cho cộng đồng mà còn cho chính cuộc sống của bạn.”',
      },
      {
        title: 'Khi đời cho bạn Pad Thá',
        abstract:
          'Mình 15 tuổi. Mình chưa từng đi bất cứ nơi đâu xa hơn miền Bắc. Số lần mình từng nhìn thấy biển chỉ đếm trên đầu một bàn tay. Vậy mà năm ấy, mình lựa chọn trao đổi tại Thái Lan trong 3 tháng. Mình đi học tại một trường bản địa, sống cùng chủ nhà người Thái và dành phần lớn thời gian ở một vùng quê xa lắc xa lơ. Một chữ tiếng Thái bẻ đôi cũng không biết, xung quanh là những con người đầy lạ lẫm nhưng nước mắt mình chưa từng rơi.\n' +
          'Lần đầu tiên đi máy bay, mình lóng ngóng tới mức không biết phải đặt đồ ra sao để nhân viên an ninh kiểm tra. Tim mình đập thình thịch vì không biết liệu có lỡ mang thứ gì đó không đúng quy định lên máy bay không dù đã kiểm tra vô cùng kĩ khi ở nhà. Thật may mắn khi mọi thứ đã êm xuôi.\n' +
          'Trước khi trở về nơi mình sẽ gắn bó 3 tháng, mình tham dự một buổi định hướng cùng các bạn đến từ 10 quốc gia. Thú thật, đó là lần đầu tiên mình tiếp xúc với thật nhiều người có cá tính khác biệt bản thân tới vậy. Minh vẫn nhớ tới lần khi được phân làm việc nhóm với các bạn toàn người Ý. Các bạn vừa nói tiếng Anh, vừa xen tiếng Ý khiến mình không biết bắt chuyện như thế nào. Hay đôi khi mình vô cùng bối rối khi không tìm được bạn cùng tham gia trò chơi. Mình của những khoảnh khắc ấy chỉ biết ngại ngùng cúi mặt. Có đôi khi, mắt mình hơi cay cay vì có đôi chút xấu hổ. Nhưng cuối cùng, người bạn mình nói chuyện nhiều nhất, người mình còn giữ liên lạc và ôm thật chặt để tạm biệt lại là người Ý.\n' +
          'Mình về tới vùng quê mình ở 3 tháng. Gia đình người Thái ấy chỉ có hai ông bà sắp nghỉ hưu, cô con gái gần tuổi mình đã đi học xa. Hai người lớn tuổi ít chủ đề nói chuyện, lại nói hầu hết bằng tiếng Thái. Minh có nhớ nhà không? Đương nhiên rồi. Nhiều lúc mình chỉ muốn khóc thật to vì đôi khi thật tủi thân vì không có người chia sẻ. Nhưng mình không khóc, mình lựa chọn nấu ăn, xem các video cùng họ, dành thời gian cùng họ. Mình đã hiểu biết thêm thật nhiều điều về Thái Lan, về cuộc đời, về lịch sử khi thật kiên nhẫn tìm hiểu từng chút một.\n' +
          'Những ngày cuối cùng, mình đón xe lên Bangkok chơi một chuyến. Nghĩ lại khi ấy thì thấy mình thật liều lĩnh. Mình tự bắt xe đi chơi khắp nơi. Có những lúc vì tiếc rẻ tiền xe mà mình đi bộ tới mức chân đau nhức, người ê ẩm. Ở Việt Nam, mình không đi đâu mà không có xe điện cả. Có một lần, trời đã dần tối rồi, xung quanh lại toàn xe cộ khiến mình lo lắng vô cùng. Khi trở về nhà của người chị gần tuổi đang học tại Bangkok, người mình sũng nước mưa, đôi giày lại lạo xáo đất đá len vào. Mình ăn tối bằng hai chiếc bánh nguội. Song lúc đó, lòng mình không chút nặng nề mà nhen nhóm lòng tự hào.\n' +
          'Thật ra, khi trở lại Việt Nam, mình cũng nhiều lần tự hỏi bản thân có trưởng thành hơn sau chuyến đi không. Liệu mình có phí hoài cơ hội đã được trao cho bản thân không? Nhưng hồi tưởng lại, mình thật biết ơn bản thân vì đã dũng cảm thử nhiều tới vậy. Mình mong rằng bạn cũng sẽ dành thời gian hồi tưởng lại những khoảnh khắc trong năm qua để thấy mình đã “lớn” tới nhường nào.',
      },
      {
        title:
          'I would rather be a superb meteor, every atom of me in magnificent glow, than a sleepy and permanent planet',
        abstract:
          'Có những khoảnh khắc trong đời, ta giật mình nhận ra mình đã trôi qua bao nhiêu tháng ngày mà không thực sự "sống". Tôi từng như vậy. Một người luôn cố gắng để làm hài lòng người khác, để không làm ai thất vọng, để đạt được những tiêu chuẩn vô hình mà tôi chẳng bao giờ đặt câu hỏi liệu chúng có thực sự dành cho mình hay không. Cuộc sống cứ thế trôi qua, tôi vẫn sống, vẫn làm việc, vẫn cười nói, nhưng sâu bên trong, tôi thấy trống rỗng. Mọi thứ xung quanh cứ lặp đi lặp lại như một quỹ đạo định sẵn, không có nhiệt huyết, không có đam mê, không có cả những giấc mơ từng làm tim tôi rộn ràng thuở bé. Tôi trở thành một hành tinh ngủ quên, quay mãi trong quỹ đạo của những điều "nên làm" nhưng chẳng bao giờ tự hỏi mình thực sự muốn gì. Rồi một ngày, tôi đọc được câu nói của Jack London: "I would rather be a superb meteor, every atom of me in magnificent glow, than a sleepy and permanent planet." (Tôi thà là một ngôi sao băng tráng lệ, mỗi mảnh nhỏ trong tôi đều rực sáng huy hoàng, còn hơn là một hành tinh lặng lẽ vĩnh hằng.) Lần đầu tiên sau rất lâu, tôi tự hỏi: Nếu ngày mai mọi thứ biến mất, tôi có thực sự cảm thấy mình đã sống trọn vẹn chưa?\n' +
          'Trước đây, tôi không phải là một người nhút nhát hay thiếu đam mê. Ngược lại, tôi từng có những ước mơ lớn lao, những khát vọng mãnh liệt muốn được khẳng định bản thân. Nhưng dần dần, những va vấp trong cuộc sống khiến tôi thu mình lại. Có những lần tôi dốc hết tâm huyết vào một điều gì đó, nhưng kết quả không như mong đợi. Tôi từng thử sức trong một cuộc thi mà mình đặt nhiều kỳ vọng, nhưng cuối cùng lại thất bại thảm hại. Tôi từng chia sẻ một ý tưởng với tất cả sự nhiệt huyết, nhưng nhận lại chỉ là những ánh nhìn hoài nghi. Mỗi lần như thế, tôi lại cảm thấy mình nhỏ bé hơn, yếu đuối hơn. Tôi bắt đầu sợ sai, sợ bị chê cười, sợ những nỗ lực của mình không đủ để tạo ra sự khác biệt. Dần dần, tôi học cách sống trong "vùng an toàn" của mình. Tôi chọn những gì dễ dàng, những gì ít rủi ro, những gì khiến tôi không phải đối mặt với sự tổn thương. Tôi trở thành một người chỉ biết làm theo kỳ vọng của người khác, một người luôn dè dặt, cẩn trọng, không dám bứt phá. Thế nhưng, một cuộc sống không có thử thách, không có đam mê chẳng khác nào một bức tranh đơn sắc, nhạt nhòa đến mức chính tôi cũng không còn nhận ra bản thân trong đó. Tôi dần cảm thấy mệt mỏi, trống rỗng và vô định. Đến một ngày, tôi chợt nhận ra, giữ cho bản thân an toàn chưa bao giờ là cách để tôi thực sự sống.\n' +
          'Thời gian trôi qua, tôi cứ sống như vậy một cách thụ động, không mục tiêu, không đam mê. Nhưng đến một ngày, tôi chợt nhận ra rằng mình đang đánh mất chính mình. Khoảnh khắc ấy không phải là một biến cố lớn lao, không phải là một sự kiện đặc biệt. Nó chỉ đơn giản là một buổi tối bình thường, khi tôi ngồi một mình trong căn phòng tối, nhìn chằm chằm lên trần nhà và tự hỏi: "Nếu cứ tiếp tục sống như thế này, mình sẽ trở thành ai?" Câu hỏi ấy vang vọng trong tâm trí tôi, kéo tôi ra khỏi trạng thái mơ hồ mà tôi đã chìm đắm bấy lâu nay. Tôi nhận ra rằng, một ngôi sao băng dù chỉ tỏa sáng trong khoảnh khắc cũng đáng nhớ hơn một hành tinh mãi mãi bất động. Tôi không muốn tiếp tục sống cuộc đời của một kẻ chỉ biết tồn tại, mà muốn trở thành phiên bản rực rỡ nhất của chính mình dù có phải đánh đổi bằng những vấp ngã và tổn thương.\n' +
          'Tôi bắt đầu thử những điều mình từng e ngại. Tôi lên tiếng bảo vệ quan điểm của mình thay vì im lặng vì sợ bị phản đối. Tôi thử những sở thích mới, cho phép bản thân thất bại, rồi học cách đứng dậy sau những lần vấp ngã. Tôi học cách từ chối những điều khiến mình không hạnh phúc, thay vì luôn cố gắng làm hài lòng người khác. Và quan trọng nhất, tôi buông bỏ nỗi sợ hãi đã giam cầm tôi suốt bấy lâu. Tôi chấp nhận rằng mình có thể thất bại, có thể đau lòng, nhưng ít nhất tôi đã dám sống, dám bùng cháy.\n' +
          'Dần dần, tôi nhận ra rằng thất bại không đáng sợ như tôi nghĩ. Điều đáng sợ nhất không phải là thất bại, mà là không dám thử. Tôi cũng học được rằng sự công nhận của người khác không phải là thứ quyết định giá trị của tôi. Trước đây, tôi luôn sợ bị đánh giá, sợ bị chỉ trích. Nhưng giờ đây, tôi hiểu rằng điều quan trọng nhất là tôi có đang sống đúng với bản thân mình hay không. Hãy để tương lai nói sự thật và đánh giá mỗi người theo công việc và thành tích của mình. Hiện tại là của họ, tương lai mà tôi đã nỗ lực là của tôi. Tôi hiểu rằng hành trình của mình có thể chưa hoàn hảo, có thể còn nhiều thử thách phía trước, nhưng chỉ cần tôi tiếp tục bước đi, tiếp tục sống hết mình, tương lai sẽ phản chiếu những cố gắng mà tôi đã từng bỏ ra.\n' +
          'Sống trọn vẹn quan trọng hơn là tồn tại mãi mãi. Một hành tinh có thể tồn tại hàng tỷ năm, nhưng liệu có ai thực sự nhớ đến nó? Ngược lại, một ngôi sao băng dù chỉ lướt qua trong chốc lát vẫn để lại dấu ấn trong lòng những ai may mắn nhìn thấy. Thất bại không đáng sợ bằng việc chưa bao giờ dám thử. Trước đây, tôi luôn sợ mình làm chưa đủ tốt, nhưng rồi tôi nhận ra, ngay cả khi thất bại, tôi vẫn học được điều gì đó. Còn nếu không dám thử, tôi sẽ mãi mãi chỉ là một kẻ đứng bên lề cuộc sống. Tôi không thể làm hài lòng tất cả mọi người và điều đó không sao cả. Một ngôi sao băng không cần phải bay theo quỹ đạo của bất cứ hành tinh nào khác. Tôi cũng vậy. Tôi không cần phải sống theo mong đợi của người khác, mà chỉ cần sống sao cho chính mình không cảm thấy hối tiếc.\n' +
          'Giờ đây, tôi không còn là một hành tinh ngủ quên trong vũ trụ nữa. Tôi không còn sợ vấp ngã, không còn sợ bị đánh giá. Tôi biết rằng mình có thể không hoàn hảo, nhưng tôi đang sống một cuộc đời trọn vẹn hơn bao giờ hết. Tôi chọn trở thành một ngôi sao băng dám tỏa sáng, dám theo đuổi những điều mình tin tưởng, dám cháy hết mình dù chỉ trong khoảnh khắc. Dẫu cho tương lai có ra sao, ít nhất tôi biết rằng, tôi đã từng bùng cháy huy hoàng, thay vì mãi mãi chỉ lặng lẽ quay trong quỹ đạo của sự an toàn. Bạn sẽ khám phá ra chính mình ở một bậc cao hơn sau mỗi lần vượt qua nghịch cảnh. Mỗi thử thách mà tôi đối diện, mỗi nỗi sợ mà tôi vượt qua, đều là một nấc thang đưa tôi đến phiên bản mạnh mẽ và rực rỡ hơn của chính mình. Và đó mới là điều quan trọng nhất.',
      },
      {
        title: 'Resilience – The Art of Rising Again',
        abstract:
          'Hello everyone, I am Bunny, a small rabbit living in a big city.\n' +
          "Perhaps 2024 has been a challenging year, but it has also been a journey where I learned to love myself and take better care of my mental health. If I had to choose one English word that represents this journey, I would pick 'Resilience' – the ability to recover and rise again after difficulties.\n" +
          "Looking back on the past year, I often felt lost. I no longer found joy in my studies, gradually distanced myself from schoolwork, and lived under the pressure of expectations. I worried about the future, feared my own decisions, and felt exhausted both physically and mentally. During those times, I kept asking myself, 'Am I on the right path? Did I do something wrong?'\n" +
          'However, instead of sinking deeper into negativity, I decided to change – little by little. I started with small things: reading books about psychology, writing a journal to release my emotions, listening to podcasts, and watching videos that conveyed messages I could relate to. Most importantly, I learned to listen to myself. I realized that constantly trying to please everyone only made me lose my true self. I allowed myself to rest and accepted that I didn’t always have to be strong.\n' +
          'One significant milestone in this journey was my decision to try tutoring. I had never thought of myself as a teacher before, but when I helped an eighth-grade student understand his lessons, I felt a small joy that I had forgotten for a long time. This job helped me rediscover my self-worth, develop patience, and see that even when I felt lost, I could still contribute in meaningful ways.\n' +
          'Besides that, I also learned to take care of my physical health to improve my mental well-being. With constant back pain and fatigue, I started paying more attention to light exercise, maintaining proper posture while studying and working, and incorporating enough rest. Each small change brought positive effects, helping me regain energy and a sense of control in my life.\n' +
          'I can’t say that I have completely overcome negative emotions. But the most important thing is that I have learned how to face them instead of running away or blaming myself. I understand that the journey of self-love is not a destination but an ongoing process. Today might be a bad day—exhausting and forgettable—but if you love yourself, think positively, and keep pushing forward, I believe it will be just one bad day, not a bad life.\n' +
          "'Resilience' – the ability to rise after falling – is what I cherish most in 2024. This journey has taught me that even in moments of uncertainty, as long as I don’t give up, I will always find my own light.\n" +
          "Yeah, that's my story, my journey of striving to heal myself. Thanks for reading, love you, guys.",
      },
      {
        title: 'HOA NỞ TỪ BÊN TRONG',
        abstract:
          "Trong giáo lý Phật giáo có câu: 'Thương mình trước rồi hãy thương người.' Nghe qua tưởng chừng đơn giản nhưng lại không dễ thực hành. Đã có lúc mình nghĩ yêu bản thân là một điều ích kỷ, và hạnh phúc chỉ thực sự có ý nghĩa khi ta cho đi tất cả để làm hài lòng người khác. Nhưng rồi, mình nhận ra, lòng trống rỗng vì mãi chạy theo và vun đắp những thứ chẳng bao giờ thuộc về mình.\n" +
          'Những suy nghĩ cứ loay hoay trong tâm trí, ngỡ rằng nỗi buồn sẽ chẳng bao giờ rời đi. Và rồi, vào một ngày thu năm 2024, đứa trẻ đôi mươi trong mình chợt nhận ra một bài học quý giá: nỗi đau sẽ còn đó cho đến khi ta thực sự học được bài học của chính mình. Đó là lúc mình biết rằng mình phải tìm kiếm sự an yên giữa ngày dông bão.\n' +
          '“Be a nice human – Trở thành một người tốt hơn.”\n' +
          'Đây không chỉ là lời nhắc nhở mình phải đối xử tốt với thế gian, mà còn là sự dịu dàng với chính mình. Học cách tha thứ cho những khiếm khuyết, nhẹ nhàng với những tổn thương và cho phép bản thân rời xa những điều tiêu cực. Mình không cần phải gượng ép bản thân chấp nhận lời đề nghị của người khác, cũng chẳng phải trằn trọc hằng đêm và nguyện mong “ai đó” đến để chữa lành những tổn thương bên trong.\n' +
          "Có những ngày cảm giác như chẳng thể bước tiếp, mình chìm trong những suy tư vô tận, tự hỏi: 'Tại sao mình không giỏi giang như bao người khác?' hay 'Nếu mình cố gắng hơn, mọi thứ có tốt đẹp hơn không?' Hàng ngàn câu hỏi cứ lặng lẽ xoay vần, nhưng chẳng có lời hồi đáp. Rồi mùa hè năm ấy giúp mình nhận ra: điều mình thực sự cần chỉ là một bữa ăn sáng đủ đầy, một giấc ngủ ngon và sự bao dung với chính mình – thay vì cố níu giữ những điều vốn chẳng phải của mình.\n" +
          'Trước đây, mình cứ quẩn quanh trong quá khứ, gắng gượng mà không rõ vì điều gì. Nhưng giờ đây, mình học cách biết ơn những gì đã qua. Có những nỗi đau từng khiến mình gục ngã, và rồi cũng chính mình đã đứng lên và bước tiếp.\n' +
          'Cuộc sống này vốn dĩ thật đẹp, chỉ là đôi khi ta mải miết rong ruổi giữa những điều xa xăm mà quên mất vẻ đẹp ngay trước mắt. Hạnh phúc chưa bao giờ xa, nó vẫn ở đó, chỉ chờ ta dịu dàng để nhận ra. Học cách biết ơn, trân trọng từng khoảnh khắc và nhẹ nhàng hơn với chính mình – vì biết đâu chiếc bánh mì bạn đang ăn dở lại là ước mơ của người khác.\n' +
          'Thương mình trước rồi hãy thương người, và điều đó khiến mình trở thành một người tốt hơn',
      },
    ];

    const topics = await this.prisma.topics.findMany();

    if (!storyCount || storyCount < 5) {
      const savedStories = await Promise.all(
        [...Array(5)].map(async () => {
          await this.prisma.story.create({
            data: {
              ...faker.helpers.arrayElement(storyData),
              humanBookId: 3,
              topics: {
                create: topics.map((topic) => ({
                  topicId: topic.id,
                })),
              },
            },
            include: {
              humanBook: true,
              cover: true,
              topics: true,
            },
          });
        }),
      );

      console.log(`✅ Created ${savedStories.length} hubers`);
    }
  }
}
